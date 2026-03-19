import { Cell, CellOptions, CellData } from './Cell';
import { Shape, ShapeConfig, ShapeRenderer } from './Shape';

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
    getAnchorPoint(position: 'top' | 'right' | 'bottom' | 'left'): { x: number; y: number } {
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
