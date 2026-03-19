import { Node, NodeOptions } from './Node';
import { Edge, EdgeOptions } from './Edge';
import { Port } from './Port';

export interface Point {
    x: number;
    y: number;
}

export interface GraphOptions {
    /** 容器元素 */
    container: HTMLElement;
    /** 画布宽度 */
    width?: number;
    /** 画布高度 */
    height?: number;
    /** 初始偏移 X */
    initialOffsetX?: number;
    /** 初始偏移 Y */
    initialOffsetY?: number;
    /** 最小缩放比例 */
    minZoom?: number;
    /** 最大缩放比例 */
    maxZoom?: number;
    /** 是否启用拖拽 */
    draggable?: boolean;
    /** 是否启用缩放 */
    scalable?: boolean;
    /** 拖拽时的光标样式 */
    draggingCursor?: string;
    /** 拖拽完成回调 */
    onDragEnd?: (offset: Point) => void;
    /** 缩放完成回调 */
    onZoom?: (scale: number, offset: Point) => void;
    /** 节点选中回调 */
    onNodeSelect?: (node: Node | null) => void;
    /** 背景颜色 */
    backgroundColor?: string;
    /** 网格配置 */
    grid?: {
        enabled: boolean;
        size?: number;
        color?: string;
    };
}

export interface GraphState {
    offset: Point;
    scale: number;
    isDragging: boolean;
    lastMousePosition: Point | null;
}

/**
 * Graph - 可拖拽、可缩放的画布组件
 *
 * 功能特性：
 * - 鼠标拖拽平移画布
 * - 鼠标滚轮缩放
 * - 支持设置边界限制
 * - 网格背景（可选）
 * - 流畅的动画效果
 */
export class Graph {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private options: Required<GraphOptions>;
    private state: GraphState;
    private nodes: Map<string, Node> = new Map();
    private edges: Map<string, Edge> = new Map();
    private selectedNode: Node | null = null;
    private selectedEdge: Edge | null = null;
    private hoveredNode: Node | null = null;
    private hoveredEdge: Edge | null = null;
    private draggedNode: Node | null = null;
    private isDraggingNode: boolean = false;
    private dragStartPosition: Point = { x: 0, y: 0 };
    private dragNodeStartPosition: Point = { x: 0, y: 0 };
    private rafId: number | null = null;
    private boundHandlers: {
        onMouseDown: (e: MouseEvent) => void;
        onMouseMove: (e: MouseEvent) => void;
        onMouseUp: (e: MouseEvent) => void;
        onMouseLeave: (e: MouseEvent) => void;
        onWheel: (e: WheelEvent) => void;
        onResize: () => void;
    };

    // 默认配置
    private static readonly DEFAULT_OPTIONS: Omit<
        Required<GraphOptions>,
        'container'
    > = {
            width: 800,
            height: 600,
            initialOffsetX: 0,
            initialOffsetY: 0,
            minZoom: 0.1,
            maxZoom: 5,
            draggable: true,
            scalable: true,
            draggingCursor: 'grabbing',
            onDragEnd: () => { },
            onZoom: () => { },
            onNodeSelect: () => { },
            backgroundColor: '#ffffff',
            grid: {
                enabled: true,
                size: 20,
                color: '#e5e7eb',
            },
        };

    constructor(options: GraphOptions) {
        this.options = {
            ...Graph.DEFAULT_OPTIONS,
            ...options,
            grid: {
                ...Graph.DEFAULT_OPTIONS.grid,
                ...options.grid,
            },
        };

        this.container = options.container;
        this.state = {
            offset: {
                x: this.options.initialOffsetX,
                y: this.options.initialOffsetY,
            },
            scale: 1,
            isDragging: false,
            lastMousePosition: null,
        };

        // 创建画布元素
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d')!;

        // 绑定事件处理器
        this.boundHandlers = {
            onMouseDown: this.handleMouseDown.bind(this),
            onMouseMove: this.handleMouseMove.bind(this),
            onMouseUp: this.handleMouseUp.bind(this),
            onMouseLeave: this.handleMouseLeave.bind(this),
            onWheel: this.handleWheel.bind(this),
            onResize: this.handleResize.bind(this),
        };

        this.init();
    }

    /**
     * 创建 Canvas 元素
     */
    private createCanvas(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
      display: block;
      width: 100%;
      height: 100%;
      cursor: ${this.options.draggable ? 'grab' : 'default'};
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
    `;
        return canvas;
    }

    /**
     * 初始化组件
     */
    private init(): void {
        // 设置容器样式
        this.container.style.cssText = `
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 100%;
    `;

        // 添加画布到容器
        this.container.appendChild(this.canvas);

        // 设置画布尺寸
        this.resizeCanvas();

        // 绑定事件
        this.bindEvents();

        // 初始渲染
        this.render();
    }

    /**
     * 调整画布尺寸
     */
    private resizeCanvas(): void {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;

        // 设置上下文缩放以适应 DPR
        this.ctx.scale(dpr, dpr);

        this.render();
    }

    /**
     * 绑定事件
     */
    private bindEvents(): void {
        if (this.options.draggable) {
            this.canvas.addEventListener('mousedown', this.boundHandlers.onMouseDown);
            document.addEventListener('mousemove', this.boundHandlers.onMouseMove);
            document.addEventListener('mouseup', this.boundHandlers.onMouseUp);
            this.canvas.addEventListener(
                'mouseleave',
                this.boundHandlers.onMouseLeave
            );
        }

        if (this.options.scalable) {
            this.canvas.addEventListener('wheel', this.boundHandlers.onWheel, {
                passive: false,
            });
        }

        // 添加鼠标移动监听用于悬停检测
        this.canvas.addEventListener('mousemove', this.handleHover.bind(this));

        window.addEventListener('resize', this.boundHandlers.onResize);
    }

    /**
     * 鼠标悬停处理
     */
    private handleHover(e: MouseEvent): void {
        if (this.isDraggingNode || this.state.isDragging) return;

        const rect = this.canvas.getBoundingClientRect();
        const screenPoint: Point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        const worldPoint = this.screenToWorld(screenPoint);

        // 检查是否悬停在节点上
        const nodes = this.getAllNodes();
        let hoveredNode: Node | null = null;
        for (let i = nodes.length - 1; i >= 0; i--) {
            if (nodes[i].containsPoint(worldPoint)) {
                hoveredNode = nodes[i];
                break;
            }
        }

        if (hoveredNode) {
            this.canvas.style.cursor = 'grab';
            if (this.hoveredNode !== hoveredNode) {
                // 清除之前的悬停状态
                if (this.hoveredNode) {
                    this.hoveredNode.setHovered(false);
                }
                // 设置新的悬停状态
                this.hoveredNode = hoveredNode;
                this.hoveredNode.setHovered(true);
                this.scheduleRender();
            }
        } else {
            this.canvas.style.cursor = this.options.draggable ? 'grab' : 'default';
            if (this.hoveredNode) {
                this.hoveredNode.setHovered(false);
                this.hoveredNode = null;
                this.scheduleRender();
            }
        }
    }

    /**
     * 解绑事件
     */
    private unbindEvents(): void {
        this.canvas.removeEventListener(
            'mousedown',
            this.boundHandlers.onMouseDown
        );
        document.removeEventListener('mousemove', this.boundHandlers.onMouseMove);
        document.removeEventListener('mouseup', this.boundHandlers.onMouseUp);
        this.canvas.removeEventListener(
            'mouseleave',
            this.boundHandlers.onMouseLeave
        );
        this.canvas.removeEventListener('wheel', this.boundHandlers.onWheel);
        window.removeEventListener('resize', this.boundHandlers.onResize);
    }

    /**
     * 鼠标按下处理
     */
    private handleMouseDown(e: MouseEvent): void {
        if (!this.options.draggable) return;

        e.preventDefault();

        // 将鼠标位置转换为世界坐标
        const rect = this.canvas.getBoundingClientRect();
        const screenPoint: Point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        const worldPoint = this.screenToWorld(screenPoint);

        // 检查是否点击到了节点（从后往前查找，确保点击最上层的节点）
        const nodes = this.getAllNodes();
        let clickedNode: Node | null = null;
        for (let i = nodes.length - 1; i >= 0; i--) {
            if (nodes[i].containsPoint(worldPoint)) {
                clickedNode = nodes[i];
                break;
            }
        }

        if (clickedNode) {
            // 开始拖拽节点
            this.draggedNode = clickedNode;
            this.isDraggingNode = true;
            this.dragStartPosition = { ...screenPoint };
            const nodePos = clickedNode.getPosition();
            this.dragNodeStartPosition = { ...nodePos };
            
            // 选中节点
            this.selectNode(clickedNode.getId());
            
            this.canvas.style.cursor = 'grabbing';
        } else {
            // 拖拽画布
            this.state.isDragging = true;
            this.state.lastMousePosition = {
                x: e.clientX,
                y: e.clientY,
            };
            this.canvas.style.cursor = this.options.draggingCursor;
        }
    }

    /**
     * 鼠标移动处理
     */
    private handleMouseMove(e: MouseEvent): void {
        // 处理节点拖拽
        if (this.isDraggingNode && this.draggedNode) {
            const rect = this.canvas.getBoundingClientRect();
            const screenPoint: Point = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
            
            // 计算鼠标移动的差值（屏幕坐标）
            const deltaX = (screenPoint.x - this.dragStartPosition.x) / this.state.scale;
            const deltaY = (screenPoint.y - this.dragStartPosition.y) / this.state.scale;
            
            // 更新节点位置
            const newX = this.dragNodeStartPosition.x + deltaX;
            const newY = this.dragNodeStartPosition.y + deltaY;
            this.draggedNode.setPosition(newX, newY);
            
            this.scheduleRender();
            return;
        }

        // 处理画布拖拽
        if (!this.state.isDragging || !this.state.lastMousePosition) return;

        const deltaX = e.clientX - this.state.lastMousePosition.x;
        const deltaY = e.clientY - this.state.lastMousePosition.y;

        this.state.offset.x += deltaX;
        this.state.offset.y += deltaY;

        this.state.lastMousePosition = {
            x: e.clientX,
            y: e.clientY,
        };

        this.scheduleRender();
    }

    /**
     * 获取与指定节点相关的所有边
     */
    private getEdgesByNode(nodeId: string): Edge[] {
        const relatedEdges: Edge[] = [];
        this.edges.forEach((edge) => {
            if (edge.getSourceId() === nodeId || edge.getTargetId() === nodeId) {
                relatedEdges.push(edge);
            }
        });
        return relatedEdges;
    }

    /**
     * 鼠标释放处理
     */
    private handleMouseUp(): void {
        // 处理节点拖拽结束
        if (this.isDraggingNode) {
            this.isDraggingNode = false;
            this.draggedNode = null;
            this.canvas.style.cursor = 'grab';
            return;
        }

        // 处理画布拖拽结束
        if (!this.state.isDragging) return;

        this.state.isDragging = false;
        this.state.lastMousePosition = null;
        this.canvas.style.cursor = 'grab';

        // 触发拖拽完成回调
        this.options.onDragEnd({ ...this.state.offset });
    }

    /**
     * 鼠标离开处理
     */
    private handleMouseLeave(): void {
        if (this.state.isDragging) {
            this.handleMouseUp();
        }
    }

    /**
     * 滚轮缩放处理
     */
    private handleWheel(e: WheelEvent): void {
        if (!this.options.scalable) return;

        e.preventDefault();

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // 计算缩放前鼠标在世界坐标系中的位置
        const worldX = (mouseX - this.state.offset.x) / this.state.scale;
        const worldY = (mouseY - this.state.offset.y) / this.state.scale;

        // 计算新的缩放比例
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(
            this.options.minZoom,
            Math.min(this.options.maxZoom, this.state.scale * zoomFactor)
        );

        // 计算新的偏移量，保持鼠标指向的世界坐标不变
        this.state.scale = newScale;
        this.state.offset.x = mouseX - worldX * newScale;
        this.state.offset.y = mouseY - worldY * newScale;

        this.scheduleRender();

        // 触发缩放回调
        this.options.onZoom(this.state.scale, { ...this.state.offset });
    }

    /**
     * 窗口大小变化处理
     */
    private handleResize(): void {
        this.resizeCanvas();
    }

    /**
     * 调度渲染（使用 requestAnimationFrame 优化性能）
     */
    private scheduleRender(): void {
        if (this.rafId !== null) return;

        this.rafId = requestAnimationFrame(() => {
            this.rafId = null;
            this.render();
        });
    }

    /**
     * 渲染画布
     */
    private render(): void {
        const { width, height } = this.canvas.getBoundingClientRect();

        // 清空画布
        this.ctx.clearRect(0, 0, width, height);

        // 保存当前上下文状态
        this.ctx.save();

        // 应用变换
        this.ctx.translate(this.state.offset.x, this.state.offset.y);
        this.ctx.scale(this.state.scale, this.state.scale);

        // 绘制背景
        this.drawBackground();

        // 绘制网格
        if (this.options.grid.enabled) {
            this.drawGrid(width, height);
        }

        // 绘制所有边（在节点下方）
        this.renderEdges();

        // 绘制所有节点
        this.renderNodes();

        // 恢复上下文状态
        this.ctx.restore();

        // 触发自定义绘制
        this.onRender();
    }

    /**
     * 绘制背景
     */
    private drawBackground(): void {
        // 背景色已经在 CSS 中设置，这里可以添加额外的背景效果
    }

    /**
     * 绘制网格
     */
    private drawGrid(viewWidth: number, viewHeight: number): void {
        const size = this.options.grid.size ?? 20;
        const color = this.options.grid.color ?? '#e5e7eb';
        const { offset, scale } = this.state;

        // 计算可见区域在世界坐标系中的范围
        const startX = -offset.x / scale;
        const startY = -offset.y / scale;
        const endX = startX + viewWidth / scale;
        const endY = startY + viewHeight / scale;

        // 计算网格线起点（对齐到网格）
        const gridStartX = Math.floor(startX / size) * size;
        const gridStartY = Math.floor(startY / size) * size;
        const gridEndX = Math.ceil(endX / size) * size;
        const gridEndY = Math.ceil(endY / size) * size;

        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1 / scale;

        this.ctx.beginPath();

        // 绘制垂直线
        for (let x = gridStartX; x <= gridEndX; x += size) {
            this.ctx.moveTo(x, gridStartY);
            this.ctx.lineTo(x, gridEndY);
        }

        // 绘制水平线
        for (let y = gridStartY; y <= gridEndY; y += size) {
            this.ctx.moveTo(gridStartX, y);
            this.ctx.lineTo(gridEndX, y);
        }

        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * 自定义渲染钩子（子类可重写）
     */
    protected onRender(): void {
        // 子类可以重写此方法添加自定义绘制逻辑
    }

    // ==================== 节点管理方法 ====================

    /**
     * 添加节点
     * @param options - 节点配置
     * @returns 创建的节点实例
     */
    addNode(options: NodeOptions): Node {
        const node = new Node(options);
        this.nodes.set(node.getId(), node);
        this.scheduleRender();
        return node;
    }

    /**
     * 移除节点
     * @param nodeId - 节点 ID
     * @returns 是否成功移除
     */
    removeNode(nodeId: string): boolean {
        const node = this.nodes.get(nodeId);
        if (node) {
            // 如果移除的是选中的节点，取消选中
            if (this.selectedNode === node) {
                this.selectedNode = null;
                this.options.onNodeSelect(null);
            }
            this.nodes.delete(nodeId);
            this.scheduleRender();
            return true;
        }
        return false;
    }

    /**
     * 获取节点
     * @param nodeId - 节点 ID
     * @returns 节点实例或 undefined
     */
    getNode(nodeId: string): Node | undefined {
        return this.nodes.get(nodeId);
    }

    /**
     * 获取所有节点
     * @returns 节点数组
     */
    getAllNodes(): Node[] {
        return Array.from(this.nodes.values());
    }

    /**
     * 获取选中的节点
     * @returns 选中的节点或 null
     */
    getSelectedNode(): Node | null {
        return this.selectedNode;
    }

    /**
     * 选中节点
     * @param nodeId - 节点 ID
     */
    selectNode(nodeId: string | null): void {
        // 取消之前的选中
        if (this.selectedNode) {
            this.selectedNode.setSelected(false);
        }

        if (nodeId) {
            const node = this.nodes.get(nodeId);
            if (node) {
                node.setSelected(true);
                this.selectedNode = node;
            }
        } else {
            this.selectedNode = null;
        }

        this.options.onNodeSelect(this.selectedNode);
        this.scheduleRender();
    }

    /**
     * 清除所有节点
     */
    clearNodes(): void {
        this.nodes.clear();
        this.selectedNode = null;
        this.scheduleRender();
    }

    // ==================== 边管理方法 ====================

    /**
     * 添加边
     * @param options - 边配置
     * @returns 创建的边实例
     */
    addEdge(options: EdgeOptions): Edge {
        const edge = new Edge(options);
        this.edges.set(edge.getId(), edge);
        this.scheduleRender();
        return edge;
    }

    /**
     * 移除边
     * @param edgeId - 边 ID
     * @returns 是否成功移除
     */
    removeEdge(edgeId: string): boolean {
        const edge = this.edges.get(edgeId);
        if (edge) {
            if (this.selectedEdge === edge) {
                this.selectedEdge = null;
            }
            this.edges.delete(edgeId);
            this.scheduleRender();
            return true;
        }
        return false;
    }

    /**
     * 获取边
     * @param edgeId - 边 ID
     * @returns 边实例或 undefined
     */
    getEdge(edgeId: string): Edge | undefined {
        return this.edges.get(edgeId);
    }

    /**
     * 获取所有边
     * @returns 边数组
     */
    getAllEdges(): Edge[] {
        return Array.from(this.edges.values());
    }

    /**
     * 获取选中的边
     * @returns 选中的边或 null
     */
    getSelectedEdge(): Edge | null {
        return this.selectedEdge;
    }

    /**
     * 选中边
     * @param edgeId - 边 ID
     */
    selectEdge(edgeId: string | null): void {
        // 取消之前的选中
        if (this.selectedEdge) {
            this.selectedEdge.setSelected(false);
        }

        if (edgeId) {
            const edge = this.edges.get(edgeId);
            if (edge) {
                edge.setSelected(true);
                this.selectedEdge = edge;
            }
        } else {
            this.selectedEdge = null;
        }

        this.scheduleRender();
    }

    /**
     * 清除所有边
     */
    clearEdges(): void {
        this.edges.clear();
        this.selectedEdge = null;
        this.scheduleRender();
    }

    /**
     * 渲染所有边
     * @protected
     */
    protected renderEdges(): void {
        this.edges.forEach((edge) => {
            const sourceNode = this.nodes.get(edge.getSourceId());
            const targetNode = this.nodes.get(edge.getTargetId());

            if (sourceNode && targetNode) {
                const sourceAnchor = edge.getSourceAnchor();
                const targetAnchor = edge.getTargetAnchor();

                // 获取源连接点
                let sourcePoint: { x: number; y: number };
                if (sourceAnchor.portId) {
                    const port = sourceNode.getPort(sourceAnchor.portId);
                    if (port) {
                        sourcePoint = port.getConnectionPoint(
                            sourceNode.getPosition().x,
                            sourceNode.getPosition().y,
                            sourceNode.getStyle().width,
                            sourceNode.getStyle().height
                        );
                    } else {
                        // 连接桩不存在，使用位置
                        sourcePoint = sourceNode.getAnchorPoint(sourceAnchor.position || 'center');
                    }
                } else {
                    // 没有指定连接桩，使用位置
                    sourcePoint = sourceNode.getAnchorPoint(sourceAnchor.position || 'center');
                }

                // 获取目标连接点
                let targetPoint: { x: number; y: number };
                if (targetAnchor.portId) {
                    const port = targetNode.getPort(targetAnchor.portId);
                    if (port) {
                        targetPoint = port.getConnectionPoint(
                            targetNode.getPosition().x,
                            targetNode.getPosition().y,
                            targetNode.getStyle().width,
                            targetNode.getStyle().height
                        );
                    } else {
                        // 连接桩不存在，使用位置
                        targetPoint = targetNode.getAnchorPoint(targetAnchor.position || 'center');
                    }
                } else {
                    // 没有指定连接桩，使用位置
                    targetPoint = targetNode.getAnchorPoint(targetAnchor.position || 'center');
                }

                edge.draw(this.ctx, sourcePoint, targetPoint);
            }
        });
    }

    /**
     * 清除所有节点和边
     */
    clear(): void {
        this.clearNodes();
        this.clearEdges();
    }

    /**
     * 渲染所有节点
     * @protected
     */
    protected renderNodes(): void {
        this.nodes.forEach((node) => {
            node.draw(this.ctx);
        });
    }

    /**
     * 获取当前变换矩阵
     */
    getTransform(): { offset: Point; scale: number } {
        return {
            offset: { ...this.state.offset },
            scale: this.state.scale,
        };
    }

    /**
     * 设置偏移量
     */
    setOffset(offset: Point): void {
        this.state.offset = { ...offset };
        this.scheduleRender();
    }

    /**
     * 设置缩放比例
     */
    setScale(scale: number): void {
        this.state.scale = Math.max(
            this.options.minZoom,
            Math.min(this.options.maxZoom, scale)
        );
        this.scheduleRender();
    }

    /**
     * 平移到指定位置（带动画）
     */
    panTo(
        offset: Point,
        duration: number = 300,
        easing: (t: number) => number = (t) =>
            t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    ): Promise<void> {
        return new Promise((resolve) => {
            const startOffset = { ...this.state.offset };
            const startTime = performance.now();

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easing(progress);

                this.state.offset.x =
                    startOffset.x + (offset.x - startOffset.x) * easedProgress;
                this.state.offset.y =
                    startOffset.y + (offset.y - startOffset.y) * easedProgress;

                this.render();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.options.onDragEnd({ ...this.state.offset });
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    /**
     * 缩放到指定比例（带动画）
     */
    zoomTo(
        scale: number,
        duration: number = 300,
        easing: (t: number) => number = (t) =>
            t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    ): Promise<void> {
        return new Promise((resolve) => {
            const startScale = this.state.scale;
            const targetScale = Math.max(
                this.options.minZoom,
                Math.min(this.options.maxZoom, scale)
            );
            const startTime = performance.now();

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easing(progress);

                this.state.scale =
                    startScale + (targetScale - startScale) * easedProgress;

                this.render();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.options.onZoom(this.state.scale, { ...this.state.offset });
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    /**
     * 重置视图
     */
    reset(): void {
        this.state.offset = {
            x: this.options.initialOffsetX,
            y: this.options.initialOffsetY,
        };
        this.state.scale = 1;
        this.render();
    }

    /**
     * 适应内容到视图
     */
    fitToContent(
        contentBounds: { x: number; y: number; width: number; height: number },
        padding: number = 50
    ): void {
        const { width, height } = this.canvas.getBoundingClientRect();
        const contentWidth = contentBounds.width + padding * 2;
        const contentHeight = contentBounds.height + padding * 2;

        const scaleX = width / contentWidth;
        const scaleY = height / contentHeight;
        const scale = Math.min(scaleX, scaleY, this.options.maxZoom);

        const offsetX =
            (width - contentBounds.width * scale) / 2 - contentBounds.x * scale;
        const offsetY =
            (height - contentBounds.height * scale) / 2 - contentBounds.y * scale;

        this.state.scale = scale;
        this.state.offset = { x: offsetX, y: offsetY };
        this.render();
    }

    /**
     * 将屏幕坐标转换为世界坐标
     */
    screenToWorld(screenPoint: Point): Point {
        return {
            x: (screenPoint.x - this.state.offset.x) / this.state.scale,
            y: (screenPoint.y - this.state.offset.y) / this.state.scale,
        };
    }

    /**
     * 将世界坐标转换为屏幕坐标
     */
    worldToScreen(worldPoint: Point): Point {
        return {
            x: worldPoint.x * this.state.scale + this.state.offset.x,
            y: worldPoint.y * this.state.scale + this.state.offset.y,
        };
    }

    /**
     * 获取 Canvas 上下文
     */
    getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    /**
     * 获取 Canvas 元素
     */
    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    /**
     * 启用/禁用拖拽
     */
    setDraggable(enabled: boolean): void {
        this.options.draggable = enabled;
        this.canvas.style.cursor = enabled ? 'grab' : 'default';
    }

    /**
     * 启用/禁用缩放
     */
    setScalable(enabled: boolean): void {
        this.options.scalable = enabled;
    }

    /**
     * 销毁组件
     */
    destroy(): void {
        // 取消正在进行的动画
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        // 解绑事件
        this.unbindEvents();

        // 移除画布元素
        if (this.canvas.parentNode === this.container) {
            this.container.removeChild(this.canvas);
        }

        // 清空引用
        (this as any).container = null;
        (this as any).canvas = null;
        (this as any).ctx = null;
    }
}

export default Graph;
