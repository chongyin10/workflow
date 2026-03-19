import { Cell, CellOptions, CellData } from './Cell';
import { Shape, ShapeConfig, ShapeRenderer } from './Shape';
import { Port, PortOptions, PortPosition, PortManager, PortGroupOptions, PortLayoutConfig } from './Port';

// 重新导出类型，方便用户使用
export type { PortGroupOptions, PortLayoutConfig } from './Port';

/**
 * 节点样式接口
 */
export interface NodeStyle {
    /** 节点宽度 */
    width: number;
    /** 节点高度 */
    height: number;
    /** 背景颜色 */
    backgroundColor: string;
    /** 边框颜色 */
    borderColor: string;
    /** 边框宽度 */
    borderWidth: number;
    /** 边框圆角 */
    borderRadius: number;
    /** 文字颜色 */
    textColor: string;
    /** 字体大小 */
    fontSize: number;
    /** 字体 */
    fontFamily: string;
    /** 阴影颜色 */
    shadowColor: string;
    /** 阴影模糊度 */
    shadowBlur: number;
    /** 阴影偏移 X */
    shadowOffsetX: number;
    /** 阴影偏移 Y */
    shadowOffsetY: number;
    /** 选中状态边框颜色 */
    selectedBorderColor: string;
    /** 选中状态边框宽度 */
    selectedBorderWidth: number;
    /** 悬停状态背景色 */
    hoverBackgroundColor: string;
    /** 形状配置 */
    shape?: ShapeConfig;
}

/**
 * 节点位置接口
 */
export interface NodePosition {
    x: number;
    y: number;
}

/**
 * 节点数据接口
 */
export interface NodeData extends CellData {
    position: NodePosition;
}

/**
 * 节点配置选项
 */
export interface NodeOptions extends CellOptions {
    x: number;
    y: number;
    shape?: Shape | ShapeConfig;
    style?: Partial<NodeStyle>;
}

/**
 * Node - 流程图节点类
 *
 * 继承自 Cell 基类，提供：
 * - 支持自定义位置和标签
 * - 支持自定义样式
 * - 支持多种形状
 * - 提供绘制方法和碰撞检测
 */
export class Node extends Cell {
    private position: NodePosition;
    private style: NodeStyle;
    private shapeConfig: ShapeConfig;
    private ports: Map<string, Port> = new Map();
    private portManager: PortManager;

    // 默认样式
    private static readonly DEFAULT_STYLE: NodeStyle = {
        width: 120,
        height: 60,
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        borderWidth: 2,
        borderRadius: 8,
        textColor: '#ffffff',
        fontSize: 14,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 4,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        selectedBorderColor: '#f59e0b',
        selectedBorderWidth: 3,
        hoverBackgroundColor: '#60a5fa',
        shape: { type: Shape.Rect, borderRadius: 8 },
    };

    /**
     * 可用的形状类型
     */
    static readonly Shape = Shape;

    /**
     * CSS 样式字符串 - 可用于外部容器
     */
    static readonly CSS_STYLES = `
        ${Cell.BASE_CSS_STYLES}
        
        .node-container {
            position: relative;
            user-select: none;
            -webkit-user-select: none;
        }
        
        .node {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
            transition: box-shadow 0.2s ease;
        }
        
        .node:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .node:active {
            cursor: grabbing;
        }
        
        .node.selected {
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.5);
        }
        
        .node-label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            pointer-events: none;
        }
    `;

    constructor(options: NodeOptions) {
        super(options);
        this.position = { x: options.x, y: options.y };
        this.style = { ...Node.DEFAULT_STYLE, ...options.style };
        
        // 解析 shape 配置
        if (options.shape) {
            if (typeof options.shape === 'string') {
                this.shapeConfig = { type: options.shape as Shape };
            } else {
                this.shapeConfig = options.shape;
            }
        } else {
            this.shapeConfig = { type: Shape.Rect, borderRadius: this.style.borderRadius };
        }

        // 初始化连接桩管理器
        this.portManager = new PortManager(
            this.id,
            this.style.width,
            this.style.height
        );
    }

    /**
     * 获取节点位置
     */
    getPosition(): NodePosition {
        return { ...this.position };
    }

    /**
     * 设置节点位置
     */
    setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
    }

    /**
     * 移动节点（相对位置）
     */
    move(deltaX: number, deltaY: number): void {
        this.position.x += deltaX;
        this.position.y += deltaY;
    }

    /**
     * 获取节点样式
     */
    getStyle(): NodeStyle {
        return { ...this.style };
    }

    /**
     * 更新节点样式
     */
    updateStyle(style: Partial<NodeStyle>): void {
        this.style = { ...this.style, ...style };
        // 更新连接桩管理器的尺寸
        this.portManager.updateNodeSize(this.style.width, this.style.height);
    }

    /**
     * 获取节点边界框
     */
    getBounds(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.position.x - this.style.width / 2,
            y: this.position.y - this.style.height / 2,
            width: this.style.width,
            height: this.style.height,
        };
    }

    /**
     * 检查点是否在节点内
     */
    containsPoint(point: { x: number; y: number }): boolean {
        return ShapeRenderer.containsPoint(
            this.shapeConfig,
            point.x,
            point.y,
            this.position.x,
            this.position.y,
            this.style.width,
            this.style.height
        );
    }

    /**
     * 绘制节点
     * @param ctx - Canvas 2D 上下文
     */
    draw(ctx: CanvasRenderingContext2D): void {
        const style = this.style;

        ctx.save();

        // 绘制阴影
        if (style.shadowBlur > 0) {
            ctx.shadowColor = style.shadowColor;
            ctx.shadowBlur = style.shadowBlur;
            ctx.shadowOffsetX = style.shadowOffsetX;
            ctx.shadowOffsetY = style.shadowOffsetY;
        }

        // 更新 shapeConfig 的圆角（如果是矩形）
        if (this.shapeConfig.type === Shape.Rect && !this.shapeConfig.borderRadius) {
            this.shapeConfig.borderRadius = style.borderRadius;
        }

        // 绘制形状背景
        ShapeRenderer.draw(
            ctx,
            this.shapeConfig,
            this.position.x,
            this.position.y,
            style.width,
            style.height
        );

        // 根据状态设置背景色
        if (this.isHovered) {
            ctx.fillStyle = style.hoverBackgroundColor;
        } else {
            ctx.fillStyle = style.backgroundColor;
        }
        ctx.fill();

        // 绘制边框
        ctx.shadowColor = 'transparent'; // 边框不需要阴影
        ctx.lineWidth = this.isSelected ? style.selectedBorderWidth : style.borderWidth;
        ctx.strokeStyle = this.isSelected ? style.selectedBorderColor : style.borderColor;
        ctx.stroke();

        // 绘制文字
        ctx.fillStyle = style.textColor;
        ctx.font = `${style.fontSize}px ${style.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 处理文字截断
        const maxTextWidth = style.width - 20;
        let displayLabel = this.label;
        const textMetrics = ctx.measureText(displayLabel);
        
        if (textMetrics.width > maxTextWidth) {
            // 截断文字并添加省略号
            let truncated = displayLabel;
            while (ctx.measureText(truncated + '...').width > maxTextWidth && truncated.length > 0) {
                truncated = truncated.slice(0, -1);
            }
            displayLabel = truncated + '...';
        }
        
        ctx.fillText(displayLabel, this.position.x, this.position.y);

        ctx.restore();

        // 绘制所有连接桩
        this.drawAllPorts(ctx);
    }

    /**
     * 绘制节点连接点（锚点）
     * @param ctx - Canvas 2D 上下文
     * @param position - 连接点位置：'top' | 'right' | 'bottom' | 'left'
     */
    drawAnchor(
        ctx: CanvasRenderingContext2D,
        position: 'top' | 'right' | 'bottom' | 'left'
    ): void {
        const anchorSize = 6;
        let anchorX = this.position.x;
        let anchorY = this.position.y;

        switch (position) {
            case 'top':
                anchorY = this.position.y - this.style.height / 2;
                break;
            case 'right':
                anchorX = this.position.x + this.style.width / 2;
                break;
            case 'bottom':
                anchorY = this.position.y + this.style.height / 2;
                break;
            case 'left':
                anchorX = this.position.x - this.style.width / 2;
                break;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(anchorX, anchorY, anchorSize, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    /**
     * 获取连接点坐标
     * @param position - 连接点位置
     */
    getAnchorPoint(position: 'top' | 'right' | 'bottom' | 'left' | 'center'): { x: number; y: number } {
        if (position === 'center') {
            return { x: this.position.x, y: this.position.y };
        }
        return ShapeRenderer.getAnchorPoint(
            this.shapeConfig,
            position,
            this.position.x,
            this.position.y,
            this.style.width,
            this.style.height
        );
    }

    /**
     * 获取形状配置
     */
    getShapeConfig(): ShapeConfig {
        return { ...this.shapeConfig };
    }

    /**
     * 设置形状配置
     */
    setShapeConfig(shape: Shape | ShapeConfig): void {
        if (typeof shape === 'string') {
            this.shapeConfig = { type: shape as Shape };
        } else {
            this.shapeConfig = shape;
        }
    }

    /**
     * 绘制所有连接点
     * @param ctx - Canvas 2D 上下文
     */
    drawAllAnchors(ctx: CanvasRenderingContext2D): void {
        this.drawAnchor(ctx, 'top');
        this.drawAnchor(ctx, 'right');
        this.drawAnchor(ctx, 'bottom');
        this.drawAnchor(ctx, 'left');
    }

    // ==================== 连接桩 (Port) 管理方法 ====================

    /**
     * 获取连接桩管理器
     * @returns PortManager 实例
     */
    getPortManager(): PortManager {
        return this.portManager;
    }

    /**
     * 批量添加连接桩组（支持自适应布局）
     * @param options - 连接桩组配置
     * @returns 创建的连接桩数组
     * @example
     * ```typescript
     * // 添加3个顶部连接桩，自动均匀分布
     * node.addPortGroup({
     *     id: 'top-inputs',
     *     position: 'top',
     *     count: 3
     * });
     *
     * // 自定义每个连接桩
     * node.addPortGroup({
     *     id: 'right-outputs',
     *     position: 'right',
     *     count: 4,
     *     portConfig: (index) => ({
     *         id: `output-${index}`,
     *         label: `输出 ${index + 1}`,
     *         style: { fillColor: '#3b82f6' }
     *     })
     * });
     * ```
     */
    addPortGroup(options: PortGroupOptions): Port[] {
        return this.portManager.addPortGroup(options);
    }

    /**
     * 移除连接桩组
     * @param groupId - 组ID
     * @returns 是否成功移除
     */
    removePortGroup(groupId: string): boolean {
        return this.portManager.removePortGroup(groupId);
    }

    /**
     * 更新连接桩组
     * @param groupId - 组ID
     * @param newCount - 新的连接桩数量
     * @returns 是否更新成功
     */
    updatePortGroup(groupId: string, newCount: number): boolean {
        return this.portManager.updatePortGroup(groupId, newCount);
    }

    /**
     * 获取某侧的所有连接桩
     * @param position - 边侧位置
     * @returns 连接桩数组
     */
    getPortsBySide(position: 'top' | 'right' | 'bottom' | 'left'): Port[] {
        return this.portManager.getPortsBySide(position);
    }

    /**
     * 设置某侧的布局配置
     * @param position - 边侧位置
     * @param config - 布局配置
     */
    setSideLayoutConfig(
        position: 'top' | 'right' | 'bottom' | 'left',
        config: Partial<PortLayoutConfig>
    ): void {
        this.portManager.setSideLayoutConfig(position, config);
    }

    /**
     * 获取某侧连接桩的数量
     * @param position - 边侧位置
     * @returns 连接桩数量
     */
    getPortCountBySide(position: 'top' | 'right' | 'bottom' | 'left'): number {
        return this.portManager.getPortCountBySide(position);
    }

    // ==================== 向后兼容的 Port 管理方法 ====================

    /**
     * 添加连接桩（支持自适应布局）
     * @param options - 连接桩配置
     * @param layoutConfig - 可选的布局配置（当位置为边侧时生效）
     * @returns 创建的连接桩实例
     */
    addPort(
        options: Omit<PortOptions, 'nodeId'>,
        layoutConfig?: Partial<PortLayoutConfig>
    ): Port {
        // 如果位置是边侧，使用 PortManager 进行自适应布局
        if (typeof options.position === 'string' &&
            ['top', 'right', 'bottom', 'left'].includes(options.position)) {
            return this.portManager.addPort(options, layoutConfig);
        }
        
        // 否则使用传统方式添加
        const port = new Port({
            ...options,
            nodeId: this.id,
        });
        this.ports.set(port.getId(), port);
        return port;
    }

    /**
     * 移除连接桩
     * @param portId - 连接桩 ID
     * @returns 是否成功移除
     */
    removePort(portId: string): boolean {
        // 先尝试从 PortManager 移除
        if (this.portManager.hasPort(portId)) {
            return this.portManager.removePort(portId);
        }
        // 否则从传统 Map 移除
        return this.ports.delete(portId);
    }

    /**
     * 获取连接桩
     * @param portId - 连接桩 ID
     * @returns 连接桩实例或 undefined
     */
    getPort(portId: string): Port | undefined {
        // 先尝试从 PortManager 获取
        const portFromManager = this.portManager.getPort(portId);
        if (portFromManager) return portFromManager;
        // 否则从传统 Map 获取
        return this.ports.get(portId);
    }

    /**
     * 获取所有连接桩（包括 PortManager 和传统方式添加的）
     * @returns 连接桩数组
     */
    getAllPorts(): Port[] {
        const managerPorts = this.portManager.getAllPorts();
        const legacyPorts = Array.from(this.ports.values());
        return [...managerPorts, ...legacyPorts];
    }

    /**
     * 根据位置获取连接桩
     * @param position - 连接桩位置
     * @returns 连接桩实例或 undefined
     */
    getPortByPosition(position: PortPosition): Port | undefined {
        // 先检查 PortManager 中的连接桩
        const managerPort = this.portManager.getAllPorts().find(port => {
            const portPos = port.getPosition();
            if (typeof position === 'object' && typeof portPos === 'object') {
                return position.x === portPos.x && position.y === portPos.y;
            }
            return position === portPos;
        });
        if (managerPort) return managerPort;

        // 再检查传统方式添加的连接桩
        for (const port of this.ports.values()) {
            const portPos = port.getPosition();
            if (typeof position === 'object' && typeof portPos === 'object') {
                if (position.x === portPos.x && position.y === portPos.y) {
                    return port;
                }
            } else if (position === portPos) {
                return port;
            }
        }
        return undefined;
    }

    /**
     * 清除所有连接桩
     */
    clearPorts(): void {
        this.portManager.clearPorts();
        this.ports.clear();
    }

    /**
     * 绘制所有连接桩
     * @param ctx - Canvas 2D 上下文
     */
    drawAllPorts(ctx: CanvasRenderingContext2D): void {
        // 绘制 PortManager 管理的连接桩
        this.portManager.getAllPorts().forEach((port) => {
            port.draw(ctx, this.position.x, this.position.y, this.style.width, this.style.height);
        });
        
        // 绘制传统方式添加的连接桩
        this.ports.forEach((port) => {
            port.draw(ctx, this.position.x, this.position.y, this.style.width, this.style.height);
        });
    }

    /**
     * 获取连接桩的连接点坐标
     * @param portId - 连接桩 ID
     * @returns 连接点坐标或 null
     */
    getPortConnectionPoint(portId: string): { x: number; y: number } | null {
        // 先尝试从 PortManager 获取
        const port = this.portManager.getPort(portId);
        if (port) {
            return port.getConnectionPoint(this.position.x, this.position.y, this.style.width, this.style.height);
        }
        
        // 否则从传统 Map 获取
        const legacyPort = this.ports.get(portId);
        if (legacyPort) {
            return legacyPort.getConnectionPoint(this.position.x, this.position.y, this.style.width, this.style.height);
        }
        return null;
    }

    /**
     * 检查点是否在连接桩上
     * @param point - 要检查的点
     * @returns 连接桩实例或 null
     */
    getPortAtPoint(point: { x: number; y: number }): Port | null {
        // 先检查 PortManager 管理的连接桩
        for (const port of this.portManager.getAllPorts()) {
            if (port.containsPoint(point, this.position.x, this.position.y, this.style.width, this.style.height)) {
                return port;
            }
        }
        
        // 再检查传统方式添加的连接桩
        for (const port of this.ports.values()) {
            if (port.containsPoint(point, this.position.x, this.position.y, this.style.width, this.style.height)) {
                return port;
            }
        }
        return null;
    }

    /**
     * 序列化为 JSON
     */
    toJSON(): NodeData {
        return {
            id: this.id,
            label: this.label,
            position: { ...this.position },
            data: { ...this.data },
        };
    }

    /**
     * 从 JSON 创建节点
     */
    static fromJSON(data: NodeData): Node {
        return new Node({
            id: data.id,
            label: data.label,
            x: data.position.x,
            y: data.position.y,
            data: data.data,
        });
    }

    /**
     * 克隆节点
     */
    clone(newId?: string): Node {
        return new Node({
            id: newId || `${this.id}_clone`,
            label: this.label,
            x: this.position.x + 20,
            y: this.position.y + 20,
            style: { ...this.style },
            data: { ...this.data },
        });
    }
}

export default Node;
