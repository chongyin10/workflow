import { Cell, CellOptions, CellData } from './Cell';

/**
 * 边样式接口
 */
export interface EdgeStyle {
    /** 线条颜色 */
    stroke: string;
    /** 线条宽度 */
    strokeWidth: number;
    /** 是否为虚线 */
    dashed: boolean;
    /** 虚线模式 [实线长度, 间隔长度] */
    dashPattern: [number, number];
    /** 箭头大小（0 表示无箭头） */
    arrowSize: number;
    /** 箭头颜色 */
    arrowColor: string;
    /** 选中状态颜色 */
    selectedStroke: string;
    /** 选中状态宽度 */
    selectedStrokeWidth: number;
    /** 悬停状态颜色 */
    hoverStroke: string;
    /** 圆角半径（用于折线） */
    cornerRadius: number;
}

/**
 * 边类型枚举
 */
export enum EdgeType {
    /** 直线 */
    Straight = 'straight',
    /** 水平折线 */
    Horizontal = 'horizontal',
    /** 垂直折线 */
    Vertical = 'vertical',
    /** 贝塞尔曲线 */
    Bezier = 'bezier',
    /** 弧度曲线 */
    Arc = 'arc',
}

/**
 * 边连接点位置
 */
export interface EdgeAnchor {
    nodeId: string;
    /** 连接桩 ID（优先使用）或位置 */
    portId?: string;
    /** 位置（当 portId 未指定时使用） */
    position?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * 边配置选项
 */
export interface EdgeOptions extends CellOptions {
    source: string | EdgeAnchor;
    target: string | EdgeAnchor;
    type?: EdgeType;
    style?: Partial<EdgeStyle>;
}

/**
 * 边数据接口
 */
export interface EdgeData extends CellData {
    source: EdgeAnchor;
    target: EdgeAnchor;
    type: EdgeType;
}

/**
 * 点坐标
 */
interface Point {
    x: number;
    y: number;
}

/**
 * Edge - 边类（节点之间的连接线）
 *
 * 继承自 Cell 基类，提供：
 * - 支持多种连接类型（直线、水平折线、垂直折线、贝塞尔曲线、弧度曲线）
 * - 支持虚线/实线
 * - 支持箭头
 * - 支持标签
 */
export class Edge extends Cell {
    private source: EdgeAnchor;
    private target: EdgeAnchor;
    private type: EdgeType;
    private style: EdgeStyle;

    // 默认样式
    private static readonly DEFAULT_STYLE: EdgeStyle = {
        stroke: '#94a3b8',
        strokeWidth: 2,
        dashed: false,
        dashPattern: [5, 5],
        arrowSize: 10,
        arrowColor: '#94a3b8',
        selectedStroke: '#f59e0b',
        selectedStrokeWidth: 3,
        hoverStroke: '#64748b',
        cornerRadius: 10,
    };

    /**
     * CSS 样式字符串 - 可用于外部容器
     */
    static readonly CSS_STYLES = `
        ${Cell.BASE_CSS_STYLES}
        
        .edge-container {
            position: relative;
        }
        
        .edge {
            cursor: pointer;
            transition: stroke 0.2s ease;
        }
        
        .edge:hover {
            stroke: #64748b;
        }
        
        .edge.selected {
            stroke: #f59e0b;
            stroke-width: 3;
        }
        
        .edge-label {
            font-size: 12px;
            fill: #475569;
            text-anchor: middle;
            dominant-baseline: middle;
            pointer-events: none;
            background: white;
            padding: 2px 6px;
            border-radius: 4px;
        }
        
        .edge-arrow {
            fill: #94a3b8;
        }
        
        .edge.selected .edge-arrow {
            fill: #f59e0b;
        }
    `;

    constructor(options: EdgeOptions) {
        super(options);
        this.type = options.type || EdgeType.Straight;
        this.style = { ...Edge.DEFAULT_STYLE, ...options.style };

        // 解析 source 和 target
        this.source = this.parseAnchor(options.source);
        this.target = this.parseAnchor(options.target);
    }

    /**
     * 解析连接点配置
     */
    private parseAnchor(anchor: string | EdgeAnchor): EdgeAnchor {
        if (typeof anchor === 'string') {
            return { nodeId: anchor, position: 'center' as any };
        }
        return anchor;
    }

    /**
     * 获取源节点 ID
     */
    getSourceId(): string {
        return this.source.nodeId;
    }

    /**
     * 获取目标节点 ID
     */
    getTargetId(): string {
        return this.target.nodeId;
    }

    /**
     * 获取源连接点配置
     */
    getSourceAnchor(): EdgeAnchor {
        return { ...this.source };
    }

    /**
     * 获取目标连接点配置
     */
    getTargetAnchor(): EdgeAnchor {
        return { ...this.target };
    }

    /**
     * 获取边类型
     */
    getType(): EdgeType {
        return this.type;
    }

    /**
     * 设置边类型
     */
    setType(type: EdgeType): void {
        this.type = type;
    }

    /**
     * 获取样式
     */
    getStyle(): EdgeStyle {
        return { ...this.style };
    }

    /**
     * 更新样式
     */
    updateStyle(style: Partial<EdgeStyle>): void {
        this.style = { ...this.style, ...style };
    }

    /**
     * 获取当前线条颜色
     */
    private getStrokeColor(): string {
        if (this.isSelected) return this.style.selectedStroke;
        if (this.isHovered) return this.style.hoverStroke;
        return this.style.stroke;
    }

    /**
     * 获取当前线条宽度
     */
    private getStrokeWidth(): number {
        return this.isSelected ? this.style.selectedStrokeWidth : this.style.strokeWidth;
    }

    private lastSegmentAngle: number = 0;

    /**
     * 获取最后一段线的角度（用于箭头方向）
     */
    private getLastSegmentAngle(): number {
        return this.lastSegmentAngle;
    }

    /**
     * 绘制边
     * @param ctx - Canvas 2D 上下文
     * @param sourcePoint - 起点坐标
     * @param targetPoint - 终点坐标
     */
    draw(ctx: CanvasRenderingContext2D, sourcePoint: Point, targetPoint: Point): void {
        ctx.save();

        // 设置线条样式
        ctx.strokeStyle = this.getStrokeColor();
        ctx.lineWidth = this.getStrokeWidth();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 设置虚线
        if (this.style.dashed) {
            ctx.setLineDash(this.style.dashPattern);
        }

        // 根据类型绘制
        ctx.beginPath();
        switch (this.type) {
            case EdgeType.Straight:
                this.drawStraight(ctx, sourcePoint, targetPoint);
                break;
            case EdgeType.Horizontal:
                this.drawHorizontal(ctx, sourcePoint, targetPoint);
                break;
            case EdgeType.Vertical:
                this.drawVertical(ctx, sourcePoint, targetPoint);
                break;
            case EdgeType.Bezier:
                this.drawBezier(ctx, sourcePoint, targetPoint);
                break;
            case EdgeType.Arc:
                this.drawArc(ctx, sourcePoint, targetPoint);
                break;
        }
        ctx.stroke();

        // 绘制箭头
        if (this.style.arrowSize > 0) {
            this.drawArrow(ctx, targetPoint, this.getLastSegmentAngle());
        }

        // 绘制标签
        if (this.label) {
            this.drawLabel(ctx, sourcePoint, targetPoint);
        }

        ctx.restore();
    }

    /**
     * 绘制直线
     */
    private drawStraight(ctx: CanvasRenderingContext2D, source: Point, target: Point): void {
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        this.lastSegmentAngle = Math.atan2(target.y - source.y, target.x - source.x);
    }

    /**
     * 绘制水平折线
     */
    private drawHorizontal(ctx: CanvasRenderingContext2D, source: Point, target: Point): void {
        const midX = (source.x + target.x) / 2;
        const r = this.style.cornerRadius;

        ctx.moveTo(source.x, source.y);

        if (Math.abs(target.x - source.x) > 2 * r) {
            // 有足够的空间绘制圆角
            if (source.x < target.x) {
                ctx.lineTo(midX - r, source.y);
                ctx.quadraticCurveTo(midX, source.y, midX, source.y + (target.y > source.y ? r : -r));
            } else {
                ctx.lineTo(midX + r, source.y);
                ctx.quadraticCurveTo(midX, source.y, midX, source.y + (target.y > source.y ? r : -r));
            }
            ctx.lineTo(midX, target.y - (target.y > source.y ? r : -r));
            ctx.quadraticCurveTo(midX, target.y, midX + (target.x > source.x ? r : -r), target.y);
        } else {
            ctx.lineTo(midX, source.y);
            ctx.lineTo(midX, target.y);
        }

        ctx.lineTo(target.x, target.y);

        // 计算最后一段的角度
        this.lastSegmentAngle = Math.atan2(target.y - (source.y + target.y) / 2, target.x - midX);
    }

    /**
     * 绘制垂直折线
     */
    private drawVertical(ctx: CanvasRenderingContext2D, source: Point, target: Point): void {
        const midY = (source.y + target.y) / 2;
        const r = this.style.cornerRadius;

        ctx.moveTo(source.x, source.y);

        if (Math.abs(target.y - source.y) > 2 * r) {
            // 有足够的空间绘制圆角
            if (source.y < target.y) {
                ctx.lineTo(source.x, midY - r);
                ctx.quadraticCurveTo(source.x, midY, source.x + (target.x > source.x ? r : -r), midY);
            } else {
                ctx.lineTo(source.x, midY + r);
                ctx.quadraticCurveTo(source.x, midY, source.x + (target.x > source.x ? r : -r), midY);
            }
            ctx.lineTo(target.x - (target.x > source.x ? r : -r), midY);
            ctx.quadraticCurveTo(target.x, midY, target.x, midY + (target.y > source.y ? r : -r));
        } else {
            ctx.lineTo(source.x, midY);
            ctx.lineTo(target.x, midY);
        }

        ctx.lineTo(target.x, target.y);

        // 计算最后一段的角度
        this.lastSegmentAngle = Math.atan2(target.y - midY, target.x - (source.x + target.x) / 2);
    }

    /**
     * 绘制贝塞尔曲线
     */
    private drawBezier(ctx: CanvasRenderingContext2D, source: Point, target: Point): void {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 控制点距离
        const controlDist = dist * 0.5;

        // 根据连接点位置确定控制点方向
        const cp1x = source.x + this.getDirectionX(this.source.position) * controlDist;
        const cp1y = source.y + this.getDirectionY(this.source.position) * controlDist;
        const cp2x = target.x + this.getDirectionX(this.target.position) * controlDist;
        const cp2y = target.y + this.getDirectionY(this.target.position) * controlDist;

        ctx.moveTo(source.x, source.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, target.x, target.y);

        // 计算终点处的切线角度
        const t = 0.95; // 接近终点的位置
        const mt = 1 - t;
        const x = mt * mt * mt * source.x + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * target.x;
        const y = mt * mt * mt * source.y + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * target.y;
        this.lastSegmentAngle = Math.atan2(target.y - y, target.x - x);
    }

    /**
     * 绘制弧度曲线
     */
    private drawArc(ctx: CanvasRenderingContext2D, source: Point, target: Point): void {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;

        // 计算弧度控制点
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const arcHeight = dist * 0.2;

        // 垂直于连线方向的偏移
        const perpX = -dy / dist * arcHeight;
        const perpY = dx / dist * arcHeight;

        const controlX = midX + perpX;
        const controlY = midY + perpY;

        ctx.moveTo(source.x, source.y);
        ctx.quadraticCurveTo(controlX, controlY, target.x, target.y);

        // 计算终点处的切线角度
        this.lastSegmentAngle = Math.atan2(target.y - controlY, target.x - controlX);
    }

    /**
     * 获取方向 X 分量
     */
    private getDirectionX(position: string | undefined): number {
        switch (position) {
            case 'left':
                return -1;
            case 'right':
                return 1;
            default:
                return 0;
        }
    }

    /**
     * 获取方向 Y 分量
     */
    private getDirectionY(position: string | undefined): number {
        switch (position) {
            case 'top':
                return -1;
            case 'bottom':
                return 1;
            default:
                return 0;
        }
    }

    /**
     * 绘制箭头
     */
    private drawArrow(ctx: CanvasRenderingContext2D, point: Point, angle: number): void {
        const size = this.style.arrowSize;
        const color = this.isSelected ? this.style.selectedStroke : this.style.arrowColor;

        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-size, -size / 2);
        ctx.lineTo(-size, size / 2);
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.fill();

        ctx.restore();
    }

    /**
     * 绘制标签
     */
    private drawLabel(ctx: CanvasRenderingContext2D, source: Point, target: Point): void {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;

        ctx.save();

        // 绘制标签背景
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        const textMetrics = ctx.measureText(this.label);
        const padding = 4;
        const bgWidth = textMetrics.width + padding * 2;
        const bgHeight = 20;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        this.roundRect(
            ctx,
            midX - bgWidth / 2,
            midY - bgHeight / 2,
            bgWidth,
            bgHeight,
            4
        );
        ctx.fill();

        // 绘制标签文字
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.label, midX, midY);

        ctx.restore();
    }

    /**
     * 绘制圆角矩形
     */
    private roundRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ): void {
        const r = Math.min(radius, width / 2, height / 2);
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    /**
     * 序列化为 JSON
     */
    toJSON(): EdgeData {
        return {
            id: this.id,
            label: this.label,
            source: { ...this.source },
            target: { ...this.target },
            type: this.type,
            data: { ...this.data },
        };
    }

    /**
     * 从 JSON 创建边
     */
    static fromJSON(data: EdgeData): Edge {
        return new Edge({
            id: data.id,
            source: data.source,
            target: data.target,
            type: data.type,
            label: data.label,
            data: data.data,
        });
    }

    /**
     * 克隆边
     */
    clone(newId?: string): Edge {
        return new Edge({
            id: newId || `${this.id}_clone`,
            source: { ...this.source },
            target: { ...this.target },
            type: this.type,
            label: this.label,
            style: { ...this.style },
            data: { ...this.data },
        });
    }
}

export default Edge;
