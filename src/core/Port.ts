import { Cell, CellOptions, CellData } from './Cell';
import { Shape, ShapeConfig } from './Shape';

/**
 * 连接桩位置类型
 */
export type PortPosition = 'top' | 'right' | 'bottom' | 'left' | 'center' | { x: number; y: number };

/**
 * 连接桩样式接口
 */
export interface PortStyle {
    /** 连接桩宽度/直径 */
    width: number;
    /** 连接桩高度（用于非圆形） */
    height: number;
    /** 填充颜色 */
    fillColor: string;
    /** 边框颜色 */
    strokeColor: string;
    /** 边框宽度 */
    strokeWidth: number;
    /** 悬停填充颜色 */
    hoverFillColor: string;
    /** 悬停边框颜色 */
    hoverStrokeColor: string;
    /** 选中填充颜色 */
    selectedFillColor: string;
    /** 选中边框颜色 */
    selectedStrokeColor: string;
    /** 背景色（用于透明连接桩） */
    backgroundColor: string;
}

/**
 * 连接桩数据接口
 */
export interface PortData extends CellData {
    nodeId: string;
    position: PortPosition;
}

/**
 * 连接桩配置选项
 */
export interface PortOptions extends CellOptions {
    /** 所属节点ID */
    nodeId: string;
    /** 连接桩位置 */
    position: PortPosition;
    /** 是否可见（false 表示直接连接到节点边缘，不显示连接桩图形） */
    visible?: boolean;
    /** 连接桩样式 */
    style?: Partial<PortStyle>;
    /** 形状配置 */
    shape?: Shape | ShapeConfig;
}

/**
 * Port - 连接桩类
 *
 * 连接桩是节点边缘的连接点，用于边与节点的连接：
 * - 支持预设位置（top/right/bottom/left/center）
 * - 支持自定义坐标位置
 * - 支持自定义样式（颜色、大小、边框）
 * - 支持自定义形状（圆形、矩形等）
 * - 支持隐藏（直接连接到节点边缘）
 * - 支持悬停和选中状态
 */
export class Port extends Cell {
    private nodeId: string;
    private position: PortPosition;
    private visible: boolean;
    private style: PortStyle;
    private shapeConfig: ShapeConfig;

    // 默认样式
    private static readonly DEFAULT_STYLE: PortStyle = {
        width: 12,
        height: 12,
        fillColor: '#ffffff',
        strokeColor: '#64748b',
        strokeWidth: 2,
        hoverFillColor: '#e2e8f0',
        hoverStrokeColor: '#3b82f6',
        selectedFillColor: '#dbeafe',
        selectedStrokeColor: '#3b82f6',
        backgroundColor: 'transparent',
    };

    /**
     * CSS 样式字符串
     */
    static readonly CSS_STYLES = `
        ${Cell.BASE_CSS_STYLES}
        
        .port {
            cursor: crosshair;
            transition: all 0.2s ease;
        }
        
        .port:hover {
            transform: scale(1.2);
        }
        
        .port.hidden {
            display: none;
        }
    `;

    constructor(options: PortOptions) {
        super(options);
        this.nodeId = options.nodeId;
        this.position = options.position;
        this.visible = options.visible !== false; // 默认可见
        this.style = { ...Port.DEFAULT_STYLE, ...options.style };

        // 解析形状配置
        if (options.shape) {
            if (typeof options.shape === 'string') {
                this.shapeConfig = { type: options.shape as Shape };
            } else {
                this.shapeConfig = options.shape;
            }
        } else {
            this.shapeConfig = { type: Shape.Circle };
        }
    }

    /**
     * 获取所属节点ID
     */
    getNodeId(): string {
        return this.nodeId;
    }

    /**
     * 获取连接桩位置配置
     */
    getPosition(): PortPosition {
        return this.position;
    }

    /**
     * 设置连接桩位置
     */
    setPosition(position: PortPosition): void {
        this.position = position;
    }

    /**
     * 是否可见
     */
    isVisible(): boolean {
        return this.visible;
    }

    /**
     * 设置可见性
     */
    setVisible(visible: boolean): void {
        this.visible = visible;
    }

    /**
     * 获取样式
     */
    getStyle(): PortStyle {
        return { ...this.style };
    }

    /**
     * 更新样式
     */
    updateStyle(style: Partial<PortStyle>): void {
        this.style = { ...this.style, ...style };
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
     * 计算连接桩在世界坐标系中的实际位置
     * @param nodeX - 节点中心 X 坐标
     * @param nodeY - 节点中心 Y 坐标
     * @param nodeWidth - 节点宽度
     * @param nodeHeight - 节点高度
     */
    calculatePosition(
        nodeX: number,
        nodeY: number,
        nodeWidth: number,
        nodeHeight: number
    ): { x: number; y: number } {
        const halfWidth = nodeWidth / 2;
        const halfHeight = nodeHeight / 2;

        if (typeof this.position === 'object' && 'x' in this.position) {
            // 自定义坐标位置（相对于节点中心的偏移）
            return {
                x: nodeX + this.position.x,
                y: nodeY + this.position.y,
            };
        }

        // 预设位置
        switch (this.position) {
            case 'top':
                return { x: nodeX, y: nodeY - halfHeight };
            case 'right':
                return { x: nodeX + halfWidth, y: nodeY };
            case 'bottom':
                return { x: nodeX, y: nodeY + halfHeight };
            case 'left':
                return { x: nodeX - halfWidth, y: nodeY };
            case 'center':
            default:
                return { x: nodeX, y: nodeY };
        }
    }

    /**
     * 获取当前填充颜色
     */
    private getFillColor(): string {
        if (this.isSelected) return this.style.selectedFillColor;
        if (this.isHovered) return this.style.hoverFillColor;
        return this.style.fillColor;
    }

    /**
     * 获取当前边框颜色
     */
    private getStrokeColor(): string {
        if (this.isSelected) return this.style.selectedStrokeColor;
        if (this.isHovered) return this.style.hoverStrokeColor;
        return this.style.strokeColor;
    }

    /**
     * 绘制连接桩
     * @param ctx - Canvas 2D 上下文
     * @param nodeX - 节点中心 X 坐标
     * @param nodeY - 节点中心 Y 坐标
     * @param nodeWidth - 节点宽度
     * @param nodeHeight - 节点高度
     */
    draw(
        ctx: CanvasRenderingContext2D,
        nodeX: number,
        nodeY: number,
        nodeWidth: number,
        nodeHeight: number
    ): void {
        if (!this.visible) return;

        const pos = this.calculatePosition(nodeX, nodeY, nodeWidth, nodeHeight);

        ctx.save();

        // 绘制背景（如果设置）
        if (this.style.backgroundColor !== 'transparent') {
            ctx.fillStyle = this.style.backgroundColor;
            ctx.fillRect(
                pos.x - this.style.width / 2 - 2,
                pos.y - this.style.height / 2 - 2,
                this.style.width + 4,
                this.style.height + 4
            );
        }

        // 根据形状绘制
        ctx.beginPath();
        switch (this.shapeConfig.type) {
            case Shape.Rect:
                this.drawRect(ctx, pos.x, pos.y);
                break;
            case Shape.Circle:
            default:
                this.drawCircle(ctx, pos.x, pos.y);
                break;
        }

        // 填充
        ctx.fillStyle = this.getFillColor();
        ctx.fill();

        // 边框
        ctx.strokeStyle = this.getStrokeColor();
        ctx.lineWidth = this.style.strokeWidth;
        ctx.stroke();

        ctx.restore();
    }

    /**
     * 绘制圆形连接桩
     */
    private drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        const radius = Math.min(this.style.width, this.style.height) / 2;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
    }

    /**
     * 绘制矩形连接桩
     */
    private drawRect(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        const halfWidth = this.style.width / 2;
        const halfHeight = this.style.height / 2;
        ctx.rect(x - halfWidth, y - halfHeight, this.style.width, this.style.height);
    }

    /**
     * 检查点是否在连接桩内
     * @param point - 要检查的点
     * @param nodeX - 节点中心 X 坐标
     * @param nodeY - 节点中心 Y 坐标
     * @param nodeWidth - 节点宽度
     * @param nodeHeight - 节点高度
     */
    containsPoint(
        point: { x: number; y: number },
        nodeX: number,
        nodeY: number,
        nodeWidth: number,
        nodeHeight: number
    ): boolean {
        if (!this.visible) return false;

        const pos = this.calculatePosition(nodeX, nodeY, nodeWidth, nodeHeight);

        switch (this.shapeConfig.type) {
            case Shape.Rect:
                return (
                    point.x >= pos.x - this.style.width / 2 &&
                    point.x <= pos.x + this.style.width / 2 &&
                    point.y >= pos.y - this.style.height / 2 &&
                    point.y <= pos.y + this.style.height / 2
                );
            case Shape.Circle:
            default:
                const radius = Math.min(this.style.width, this.style.height) / 2;
                const dx = point.x - pos.x;
                const dy = point.y - pos.y;
                return dx * dx + dy * dy <= radius * radius;
        }
    }

    /**
     * 获取连接点坐标（供边使用）
     * @param nodeX - 节点中心 X 坐标
     * @param nodeY - 节点中心 Y 坐标
     * @param nodeWidth - 节点宽度
     * @param nodeHeight - 节点高度
     */
    getConnectionPoint(
        nodeX: number,
        nodeY: number,
        nodeWidth: number,
        nodeHeight: number
    ): { x: number; y: number } {
        return this.calculatePosition(nodeX, nodeY, nodeWidth, nodeHeight);
    }

    /**
     * 序列化为 JSON
     */
    toJSON(): PortData {
        return {
            id: this.id,
            label: this.label,
            nodeId: this.nodeId,
            position: this.position,
            data: { ...this.data },
        };
    }

    /**
     * 从 JSON 创建连接桩
     */
    static fromJSON(data: PortData): Port {
        return new Port({
            id: data.id,
            nodeId: data.nodeId,
            position: data.position,
            label: data.label,
            data: data.data,
        });
    }

    /**
     * 克隆连接桩
     */
    clone(newId?: string): Port {
        return new Port({
            id: newId || `${this.id}_clone`,
            nodeId: this.nodeId,
            position: this.position,
            visible: this.visible,
            style: { ...this.style },
            shape: { ...this.shapeConfig },
            label: this.label,
            data: { ...this.data },
        });
    }
}

export default Port;
