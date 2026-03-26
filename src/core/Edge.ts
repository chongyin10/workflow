import { Cell, CellOptions, CellData, type CellEvent } from './Cell';
import { EVENT_NAMES, type MouseEvent, type WheelEvent } from './EventManager';

/**
 * Edge 事件对象接口
 */
export interface EdgeEvent extends CellEvent {
    /** Edge 实例 */
    edge: Edge;
    /** 源节点 ID */
    sourceId: string;
    /** 目标节点 ID */
    targetId: string;
}

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
    /** 是否启用流动波浪效果 */
    animated: boolean;
    /** 波浪颜色 */
    waveColor: string;
    /** 波浪宽度 */
    waveWidth: number;
    /** 波浪长度 */
    waveLength: number;
    /** 波浪流动速度（像素/帧） */
    waveSpeed: number;
    /** 波浪透明度 */
    waveOpacity: number;
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
    /** 断开连接时的回调 */
    onDisconnect?: (edge: Edge) => void;
}

/**
 * 边数据接口
 */
export interface EdgeData extends CellData {
    source: EdgeAnchor;
    target: EdgeAnchor;
    type: EdgeType;
    /** 是否处于连接状态 */
    connected?: boolean;
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
    private onDisconnect?: (edge: Edge) => void;
    private connected: boolean = true;

    // 用于碰撞检测的点
    private lastSourcePoint: Point = { x: 0, y: 0 };
    private lastTargetPoint: Point = { x: 0, y: 0 };
    // 用于折线的中间点（已废弃，保留向后兼容）
    private lastMidPoint: Point | null = null;
    // 用于保存实际路径点（用于波浪动画）
    private pathPoints: Point[] = [];

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
        animated: false,
        waveColor: '#3b82f6',
        waveWidth: 4,
        waveLength: 20,
        waveSpeed: 2,
        waveOpacity: 0.8,
    };

    // 动画状态
    private isAnimating: boolean = false;
    private waveOffset: number = 0;

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
        this.onDisconnect = options.onDisconnect;

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
     * 获取源连接点（同 getSourceAnchor）
     */
    getSource(): EdgeAnchor {
        return { ...this.source };
    }

    /**
     * 获取目标连接点（同 getTargetAnchor）
     */
    getTarget(): EdgeAnchor {
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
     * 设置边样式（updateStyle 的别名）
     * @deprecated 请使用 updateStyle 方法
     */
    setStyle(style: Partial<EdgeStyle>): void {
        this.updateStyle(style);
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
     * @param time - 当前时间戳（用于动画）
     */
    draw(ctx: CanvasRenderingContext2D, sourcePoint: Point, targetPoint: Point, time?: number): void {
        // 如果边已断开，不绘制
        if (!this.connected) {
            return;
        }

        // 保存点用于碰撞检测
        this.lastSourcePoint = sourcePoint;
        this.lastTargetPoint = targetPoint;

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

        // 根据类型绘制路径（用于碰撞检测和波浪动画路径计算）
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

        // 如果启用了波浪动画，只绘制波浪效果，不绘制实线轨道
        // 使用 isAnimating 判断，确保动画状态一致
        // 当 time 未定义时使用 performance.now() 获取当前时间，确保动画持续播放
        if (this.isAnimating) {
            // 不绘制实线轨道，只绘制波浪
            const animationTime = time !== undefined ? time : performance.now();
            this.drawFlowingWave(ctx, sourcePoint, targetPoint, animationTime);
        } else {
            // 没有波浪动画时，绘制实线轨道
            ctx.stroke();
        }

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
        // 保存路径点
        this.pathPoints = [source, target];
        
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

        // 保存路径点（用于波浪动画）- 水平折线路径：source -> (midX, source.y) -> (midX, target.y) -> target
        this.pathPoints = [
            source,
            { x: midX, y: source.y },
            { x: midX, y: target.y },
            target
        ];

        // 保存中间点用于碰撞检测（向后兼容）
        this.lastMidPoint = { x: midX, y: target.y };

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

        // 保存路径点（用于波浪动画）- 垂直折线路径：source -> (source.x, midY) -> (target.x, midY) -> target
        this.pathPoints = [
            source,
            { x: source.x, y: midY },
            { x: target.x, y: midY },
            target
        ];

        // 保存中间点用于碰撞检测（向后兼容）
        this.lastMidPoint = { x: target.x, y: midY };

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

        // 保存路径点（用于波浪动画）- 贝塞尔曲线使用采样点
        this.pathPoints = this.sampleBezierCurve(source, { x: cp1x, y: cp1y }, { x: cp2x, y: cp2y }, target, 20);

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

        // 保存路径点（用于波浪动画）- 弧线使用采样点
        this.pathPoints = this.sampleQuadraticCurve(source, { x: controlX, y: controlY }, target, 20);

        ctx.moveTo(source.x, source.y);
        ctx.quadraticCurveTo(controlX, controlY, target.x, target.y);

        // 计算终点处的切线角度
        this.lastSegmentAngle = Math.atan2(target.y - controlY, target.x - controlX);
    }

    /**
     * 绘制流动波浪效果
     * @param ctx - Canvas 2D 上下文
     * @param source - 起点坐标
     * @param target - 终点坐标
     * @param time - 当前时间戳
     */
    private drawFlowingWave(ctx: CanvasRenderingContext2D, source: Point, target: Point, time: number): void {
        const { waveColor, waveWidth, waveLength, waveSpeed, waveOpacity } = this.style;
        
        // 计算动画偏移（波浪流动的距离）
        // 使用负号使波浪从 source（末端）流向 target（箭头端）
        const offset = (time * waveSpeed / 50) % (waveLength * 2);
        
        ctx.save();
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = waveWidth;
        ctx.lineCap = 'round';
        ctx.globalAlpha = waveOpacity;
        
        // 计算路径总长度
        const totalLength = this.calculatePathLength(source, target);
        if (totalLength === 0) {
            ctx.restore();
            return;
        }

        // 绘制多个波浪段，覆盖整个路径
        // 波浪周期为 waveLength * 2（一个波浪 + 一个间隔）
        const wavePeriod = waveLength * 2;
        
        // 从正偏移开始，使波浪从起点（source）向终点（target/箭头端）流动
        for (let pos = offset - wavePeriod; pos < totalLength; pos += wavePeriod) {
            const waveStart = pos;
            const waveEnd = pos + waveLength;
            
            // 只绘制在路径范围内的波浪
            if (waveEnd > 0 && waveStart < totalLength) {
                const startDist = Math.max(0, waveStart);
                const endDist = Math.min(totalLength, waveEnd);
                
                // 计算渐变透明度（波浪头部和尾部渐隐）
                const waveProgress = (waveStart + waveLength / 2) / totalLength;
                const fadeAlpha = Math.sin(waveProgress * Math.PI) * waveOpacity;
                
                ctx.globalAlpha = Math.min(fadeAlpha, waveOpacity);
                ctx.beginPath();
                this.drawPathSegment(ctx, source, target, startDist, endDist);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }

    /**
     * 计算路径长度
     */
    private calculatePathLength(source: Point, target: Point): number {
        // 如果有路径点，使用路径点计算精确长度
        if (this.pathPoints.length >= 2) {
            let length = 0;
            for (let i = 1; i < this.pathPoints.length; i++) {
                const dx = this.pathPoints[i].x - this.pathPoints[i - 1].x;
                const dy = this.pathPoints[i].y - this.pathPoints[i - 1].y;
                length += Math.sqrt(dx * dx + dy * dy);
            }
            return length;
        }
        
        // 回退到简单计算
        switch (this.type) {
            case EdgeType.Straight:
                return Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2));
            
            case EdgeType.Horizontal:
            case EdgeType.Vertical:
                // 折线路径长度
                if (this.lastMidPoint) {
                    const seg1 = Math.sqrt(Math.pow(this.lastMidPoint.x - source.x, 2) + Math.pow(this.lastMidPoint.y - source.y, 2));
                    const seg2 = Math.sqrt(Math.pow(target.x - this.lastMidPoint.x, 2) + Math.pow(target.y - this.lastMidPoint.y, 2));
                    return seg1 + seg2;
                }
                return Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2));
            
            case EdgeType.Bezier:
            case EdgeType.Arc:
                // 使用近似长度（控制点距离的平均值）
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;
                const dist1 = Math.sqrt(Math.pow(midX - source.x, 2) + Math.pow(midY - source.y, 2));
                const dist2 = Math.sqrt(Math.pow(target.x - midX, 2) + Math.pow(target.y - midY, 2));
                return (dist1 + dist2) * 1.2; // 曲线比直线稍长
            
            default:
                return Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2));
        }
    }

    /**
     * 绘制路径的一段（使用路径点数组）
     */
    private drawPathSegment(ctx: CanvasRenderingContext2D, source: Point, target: Point, startDist: number, endDist: number): void {
        const totalLength = this.calculatePathLength(source, target);
        if (totalLength === 0) return;

        const startRatio = Math.max(0, Math.min(1, startDist / totalLength));
        const endRatio = Math.max(0, Math.min(1, endDist / totalLength));

        // 使用路径点数组绘制
        if (this.pathPoints.length >= 2) {
            this.drawPathSegmentByPoints(ctx, startRatio, endRatio);
            return;
        }

        // 回退到旧的绘制逻辑
        const startPoint = this.getPointOnPath(source, target, startRatio);
        const endPoint = this.getPointOnPath(source, target, endRatio);

        if (!startPoint || !endPoint) return;

        // 对于曲线类型（贝塞尔曲线和弧线），使用采样点绘制以确保沿曲线
        if (this.type === EdgeType.Bezier || this.type === EdgeType.Arc) {
            this.drawCurveSegment(ctx, source, target, startRatio, endRatio);
            return;
        }

        // 对于直线，直接绘制
        if (this.type === EdgeType.Straight) {
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            return;
        }

        // 对于折线，需要处理中间点
        if ((this.type === EdgeType.Horizontal || this.type === EdgeType.Vertical) && this.lastMidPoint) {
            const midDistRatio = this.calculatePathLength(source, this.lastMidPoint) / totalLength;
            
            if (endRatio <= midDistRatio) {
                // 完全在第一段
                const segStart = this.getPointOnLine(source, this.lastMidPoint, startRatio / midDistRatio);
                const segEnd = this.getPointOnLine(source, this.lastMidPoint, endRatio / midDistRatio);
                ctx.moveTo(segStart.x, segStart.y);
                ctx.lineTo(segEnd.x, segEnd.y);
            } else if (startRatio >= midDistRatio) {
                // 完全在第二段
                const segStart = this.getPointOnLine(this.lastMidPoint, target, (startRatio - midDistRatio) / (1 - midDistRatio));
                const segEnd = this.getPointOnLine(this.lastMidPoint, target, (endRatio - midDistRatio) / (1 - midDistRatio));
                ctx.moveTo(segStart.x, segStart.y);
                ctx.lineTo(segEnd.x, segEnd.y);
            } else {
                // 跨越中间点
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.lineTo(this.lastMidPoint.x, this.lastMidPoint.y);
                ctx.lineTo(endPoint.x, endPoint.y);
            }
        }
    }

    /**
     * 使用路径点数组绘制路径段
     */
    private drawPathSegmentByPoints(ctx: CanvasRenderingContext2D, startRatio: number, endRatio: number): void {
        if (this.pathPoints.length < 2) return;

        // 计算每个点的累积距离
        const distances: number[] = [0];
        let totalLength = 0;
        for (let i = 1; i < this.pathPoints.length; i++) {
            const dx = this.pathPoints[i].x - this.pathPoints[i - 1].x;
            const dy = this.pathPoints[i].y - this.pathPoints[i - 1].y;
            totalLength += Math.sqrt(dx * dx + dy * dy);
            distances.push(totalLength);
        }

        if (totalLength === 0) return;

        const startDist = startRatio * totalLength;
        const endDist = endRatio * totalLength;

        // 找到起点和终点位置
        const points: Point[] = [];
        let started = false;

        for (let i = 0; i < this.pathPoints.length - 1; i++) {
            const segStart = distances[i];
            const segEnd = distances[i + 1];

            // 检查这一段是否在绘制范围内
            if (segEnd < startDist) continue;
            if (segStart > endDist) break;

            const p1 = this.pathPoints[i];
            const p2 = this.pathPoints[i + 1];
            const segLength = segEnd - segStart;

            if (segLength === 0) continue;

            // 计算这一段的起点
            let drawStart: Point;
            if (segStart < startDist) {
                const ratio = (startDist - segStart) / segLength;
                drawStart = {
                    x: p1.x + (p2.x - p1.x) * ratio,
                    y: p1.y + (p2.y - p1.y) * ratio
                };
            } else {
                drawStart = p1;
            }

            // 计算这一段的终点
            let drawEnd: Point;
            if (segEnd > endDist) {
                const ratio = (endDist - segStart) / segLength;
                drawEnd = {
                    x: p1.x + (p2.x - p1.x) * ratio,
                    y: p1.y + (p2.y - p1.y) * ratio
                };
            } else {
                drawEnd = p2;
            }

            if (!started) {
                points.push(drawStart);
                started = true;
            }
            points.push(drawEnd);
        }

        // 绘制路径
        if (points.length >= 2) {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
        }
    }

    /**
     * 绘制曲线段（贝塞尔曲线或弧线）
     * 使用采样点确保波浪沿着实际曲线路径绘制
     */
    private drawCurveSegment(ctx: CanvasRenderingContext2D, source: Point, target: Point, startRatio: number, endRatio: number): void {
        const numSamples = Math.max(2, Math.ceil((endRatio - startRatio) * 20)); // 根据段长度决定采样点数
        
        const points: Point[] = [];
        for (let i = 0; i <= numSamples; i++) {
            const ratio = startRatio + (endRatio - startRatio) * (i / numSamples);
            const point = this.getPointOnCurve(source, target, ratio);
            if (point) {
                points.push(point);
            }
        }

        if (points.length < 2) return;

        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
    }

    /**
     * 获取曲线（贝塞尔或弧线）上某比例的点的精确坐标
     */
    private getPointOnCurve(source: Point, target: Point, ratio: number): Point | null {
        if (ratio <= 0) return { ...source };
        if (ratio >= 1) return { ...target };

        if (this.type === EdgeType.Bezier) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const controlDist = dist * 0.5;

            const cp1x = source.x + this.getDirectionX(this.source.position) * controlDist;
            const cp1y = source.y + this.getDirectionY(this.source.position) * controlDist;
            const cp2x = target.x + this.getDirectionX(this.target.position) * controlDist;
            const cp2y = target.y + this.getDirectionY(this.target.position) * controlDist;

            // 三次贝塞尔曲线公式
            const t = ratio;
            const mt = 1 - t;
            const x = mt * mt * mt * source.x + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * target.x;
            const y = mt * mt * mt * source.y + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * target.y;
            
            return { x, y };
        }

        if (this.type === EdgeType.Arc) {
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const arcHeight = dist * 0.2;
            const perpX = -dy / dist * arcHeight;
            const perpY = dx / dist * arcHeight;
            const controlX = midX + perpX;
            const controlY = midY + perpY;

            // 二次贝塞尔曲线公式
            const t = ratio;
            const mt = 1 - t;
            const x = mt * mt * source.x + 2 * mt * t * controlX + t * t * target.x;
            const y = mt * mt * source.y + 2 * mt * t * controlY + t * t * target.y;
            
            return { x, y };
        }

        return null;
    }

    /**
     * 获取路径上某比例的点的坐标
     */
    private getPointOnPath(source: Point, target: Point, ratio: number): Point | null {
        if (ratio <= 0) return { ...source };
        if (ratio >= 1) return { ...target };

        switch (this.type) {
            case EdgeType.Straight:
                return {
                    x: source.x + (target.x - source.x) * ratio,
                    y: source.y + (target.y - source.y) * ratio
                };

            case EdgeType.Horizontal:
            case EdgeType.Vertical:
                if (this.lastMidPoint) {
                    const seg1Length = this.calculatePathLength(source, this.lastMidPoint);
                    const totalLength = this.calculatePathLength(source, target);
                    const midRatio = seg1Length / totalLength;
                    
                    if (ratio <= midRatio) {
                        return this.getPointOnLine(source, this.lastMidPoint, ratio / midRatio);
                    } else {
                        return this.getPointOnLine(this.lastMidPoint, target, (ratio - midRatio) / (1 - midRatio));
                    }
                }
                return {
                    x: source.x + (target.x - source.x) * ratio,
                    y: source.y + (target.y - source.y) * ratio
                };

            case EdgeType.Bezier:
            case EdgeType.Arc:
                // 简化处理，使用线性插值
                return {
                    x: source.x + (target.x - source.x) * ratio,
                    y: source.y + (target.y - source.y) * ratio
                };

            default:
                return {
                    x: source.x + (target.x - source.x) * ratio,
                    y: source.y + (target.y - source.y) * ratio
                };
        }
    }

    /**
     * 获取线段上某比例的点的坐标
     */
    private getPointOnLine(start: Point, end: Point, ratio: number): Point {
        return {
            x: start.x + (end.x - start.x) * ratio,
            y: start.y + (end.y - start.y) * ratio
        };
    }

    /**
     * 采样三次贝塞尔曲线点
     */
    private sampleBezierCurve(p0: Point, p1: Point, p2: Point, p3: Point, numSamples: number): Point[] {
        const points: Point[] = [];
        for (let i = 0; i <= numSamples; i++) {
            const t = i / numSamples;
            const mt = 1 - t;
            const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
            const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
            points.push({ x, y });
        }
        return points;
    }

    /**
     * 采样二次贝塞尔曲线点（弧线）
     */
    private sampleQuadraticCurve(p0: Point, p1: Point, p2: Point, numSamples: number): Point[] {
        const points: Point[] = [];
        for (let i = 0; i <= numSamples; i++) {
            const t = i / numSamples;
            const mt = 1 - t;
            const x = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
            const y = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
            points.push({ x, y });
        }
        return points;
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
            connected: this.connected,
        };
    }

    /**
     * 从 JSON 创建边
     */
    static fromJSON(data: EdgeData): Edge {
        const edge = new Edge({
            id: data.id,
            source: data.source,
            target: data.target,
            type: data.type,
            label: data.label,
            data: data.data,
        });
        if (data.connected === false) {
            edge.disconnect();
        }
        return edge;
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

    /**
     * 启动流动波浪动画
     * @param waveOptions - 可选的波浪配置，不传则使用当前样式配置
     * @returns 是否成功启动
     */
    startAnimation(waveOptions?: Partial<Pick<EdgeStyle, 'waveColor' | 'waveWidth' | 'waveLength' | 'waveSpeed' | 'waveOpacity'>>): boolean {
        if (this.isAnimating) {
            // 如果已经在动画中，更新配置
            if (waveOptions) {
                this.style = { ...this.style, ...waveOptions };
            }
            return false;
        }
        
        this.isAnimating = true;
        
        // 如果有传入配置，更新样式
        if (waveOptions) {
            this.style = {
                ...this.style,
                animated: true,
                ...waveOptions
            };
        } else {
            this.style.animated = true;
        }
        
        return true;
    }

    /**
     * 停止流动波浪动画
     * @returns 是否成功停止
     */
    stopAnimation(): boolean {
        if (!this.isAnimating) {
            return false;
        }
        this.isAnimating = false;
        this.style.animated = false;
        return true;
    }

    /**
     * 检查边是否正在播放流动动画
     * @returns 是否正在动画
     */
    isAnimationPlaying(): boolean {
        return this.isAnimating;
    }

    /**
     * 断开连接（消除连接线）
     * @returns 是否成功断开
     */
    disconnect(): boolean {
        if (!this.connected) {
            return false;
        }
        this.connected = false;
        this.onDisconnect?.(this);
        return true;
    }

    /**
     * 检查边是否处于连接状态
     * @returns 是否已连接
     */
    isConnected(): boolean {
        return this.connected;
    }

    /**
     * 重新连接（恢复连接线）
     * @returns 是否成功重连
     */
    reconnect(): boolean {
        if (this.connected) {
            return false;
        }
        this.connected = true;
        return true;
    }

    /**
     * 检测点是否在线上
     * @param point - 待检测的点
     * @param tolerance - 容差（默认 5 像素）
     * @returns 是否在线上
     */
    containsPoint(point: Point, tolerance: number = 1): boolean {
        if (!this.connected) {
            return false;
        }

        const source = this.lastSourcePoint;
        const target = this.lastTargetPoint;

        switch (this.type) {
            case EdgeType.Straight:
                return this.isPointOnLineSegment(point, source, target, tolerance);
            case EdgeType.Horizontal:
            case EdgeType.Vertical:
                if (this.lastMidPoint) {
                    // 折线有两段：source -> mid -> target
                    return this.isPointOnLineSegment(point, source, this.lastMidPoint, tolerance) ||
                           this.isPointOnLineSegment(point, this.lastMidPoint, target, tolerance);
                }
                return this.isPointOnLineSegment(point, source, target, tolerance);
            case EdgeType.Bezier:
            case EdgeType.Arc:
                // 对于贝塞尔曲线和弧线，使用近似检测（点到起止点的距离）
                return this.isPointNearCurve(point, source, target, tolerance);
            default:
                return false;
        }
    }

    /**
     * 检测点是否在线段上
     */
    private isPointOnLineSegment(
        point: Point,
        start: Point,
        end: Point,
        tolerance: number
    ): boolean {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const lenSquared = dx * dx + dy * dy;

        if (lenSquared === 0) {
            // 起点和终点重合
            const dist = Math.sqrt(
                (point.x - start.x) ** 2 + (point.y - start.y) ** 2
            );
            return dist <= tolerance;
        }

        // 计算投影参数 t
        let t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lenSquared;
        t = Math.max(0, Math.min(1, t));

        // 计算最近点
        const closestX = start.x + t * dx;
        const closestY = start.y + t * dy;

        // 计算距离
        const dist = Math.sqrt(
            (point.x - closestX) ** 2 + (point.y - closestY) ** 2
        );

        return dist <= tolerance;
    }

    /**
     * 检测点是否靠近曲线（近似检测）
     */
    private isPointNearCurve(
        point: Point,
        source: Point,
        target: Point,
        tolerance: number
    ): boolean {
        // 简化检测：检查点是否在曲线的包围盒内
        const minX = Math.min(source.x, target.x) - tolerance;
        const maxX = Math.max(source.x, target.x) + tolerance;
        const minY = Math.min(source.y, target.y) - tolerance;
        const maxY = Math.max(source.y, target.y) + tolerance;

        if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
            return false;
        }

        // 进一步检测：点到线段的距离
        return this.isPointOnLineSegment(point, source, target, tolerance * 2);
    }

    // ==================== 事件处理 ====================

    /**
     * 触发 Edge 相关事件
     * @param eventType - 事件类型（click, dblclick, contextmenu, mousedown, mousemove, mouseup, mousewheel, mouseenter, mouseleave）
     * @param originalEvent - 原始 DOM 事件
     * @param extraData - 额外的事件数据
     * @returns 是否未阻止默认行为
     */
    triggerEdgeEvent(
        eventType: string,
        originalEvent: Event,
        extraData: Partial<EdgeEvent> = {}
    ): boolean {
        const edgeEventName = `edge:${eventType}`;

        // 创建事件对象
        const eventData = this.createEdgeEvent(originalEvent, extraData);

        // 同时触发 cell:xxx 和 edge:xxx 事件
        const cellResult = this.triggerCellEvent(eventType, originalEvent, extraData);
        const edgeResult = this.emit(edgeEventName, eventData);

        return cellResult && edgeResult;
    }

    /**
     * 创建 Edge 事件对象
     */
    protected createEdgeEvent(
        originalEvent: Event,
        extraData: Partial<EdgeEvent> = {}
    ): EdgeEvent {
        const baseEvent = this.createCellEvent(originalEvent, extraData);

        return {
            ...baseEvent,
            type: 'edge',
            target: this,
            edge: this,
            sourceId: this.source.nodeId,
            targetId: this.target.nodeId,
            ...extraData,
        } as EdgeEvent;
    }

    /**
     * 获取事件名称映射
     */
    protected override getEventNameMap(): Record<string, string> {
        return {
            click: EVENT_NAMES.EDGE_CLICK,
            dblclick: EVENT_NAMES.EDGE_DBLCLICK,
            contextmenu: EVENT_NAMES.EDGE_CONTEXTMENU,
            mousedown: EVENT_NAMES.EDGE_MOUSEDOWN,
            mousemove: EVENT_NAMES.EDGE_MOUSEMOVE,
            mouseup: EVENT_NAMES.EDGE_MOUSEUP,
            mousewheel: EVENT_NAMES.EDGE_MOUSEWHEEL,
            mouseenter: EVENT_NAMES.EDGE_MOUSEENTER,
            mouseleave: EVENT_NAMES.EDGE_MOUSELEAVE,
        };
    }
}

export default Edge;
