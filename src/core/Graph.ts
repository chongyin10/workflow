import { Node, NodeOptions, type NodeEvent } from './Node';
import { DynamicHeightNode } from './DynamicNode';
import { Edge, EdgeOptions, EdgeType, type EdgeEvent } from './Edge';
import { Port, type PortEvent } from './Port';
import { EventManager, EVENT_NAMES, type BaseEvent, type MouseEvent, type WheelEvent, type EventHandler } from './EventManager';
import { Plugin } from '../plugins';

export interface Point {
    x: number;
    y: number;
}

/**
 * 连接验证上下文 - 提供给验证函数的连接信息
 */
export interface ConnectionValidateContext {
    /** 源节点 */
    sourceNode: Node;
    /** 源连接桩 */
    sourcePort: Port;
    /** 目标节点 */
    targetNode: Node;
    /** 目标连接桩 */
    targetPort: Port;
}

/**
 * 连接验证函数类型
 * @param context - 连接验证上下文
 * @returns 返回 true 允许连接，返回 false 阻止连接
 */
export type ConnectionValidator = (context: ConnectionValidateContext) => boolean;

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
    /**
     * 连接验证函数
     * 当用户尝试连接两个连接桩时调用，返回 true 允许连接，返回 false 阻止连接
     * @example
     * ```typescript
     * const graph = new Graph({
     *     container: document.getElementById('canvas'),
     *     validateConnection: ({ sourceNode, sourcePort, targetNode, targetPort }) => {
     *         // 示例1: 不允许连接到同一个节点
     *         if (sourceNode.getId() === targetNode.getId()) {
     *             return false;
     *         }
     *         // 示例2: 只允许左侧连接桩连接到右侧连接桩
     *         const sourcePos = sourcePort.getPosition();
     *         const targetPos = targetPort.getPosition();
     *         if (sourcePos !== 'right' || targetPos !== 'left') {
     *             return false;
     *         }
     *         return true;
     *     }
     * });
     * ```
     */
    validateConnection?: ConnectionValidator;
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
    private overlay: HTMLDivElement;
    private edgeCanvas: HTMLCanvasElement;
    private edgeCtx: CanvasRenderingContext2D;
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

    // 连接拖拽状态
    private isConnecting: boolean = false;
    private connectSourceNode: Node | null = null;
    private connectSourcePort: Port | null = null;
    private connectTargetNode: Node | null = null;
    private connectTargetPort: Port | null = null;
    private connectCurrentPoint: Point = { x: 0, y: 0 };
    private rafId: number | null = null;

    // HTML 节点元素管理
    private htmlNodeElements: Map<string, HTMLElement> = new Map();
    private boundHandlers: {
        onMouseDown: (e: globalThis.MouseEvent) => void;
        onMouseMove: (e: globalThis.MouseEvent) => void;
        onMouseUp: (e: globalThis.MouseEvent) => void;
        onMouseLeave: (e: globalThis.MouseEvent) => void;
        onWheel: (e: globalThis.WheelEvent) => void;
        onResize: () => void;
        onClick: (e: globalThis.MouseEvent) => void;
        onDblClick: (e: globalThis.MouseEvent) => void;
        onContextMenu: (e: globalThis.MouseEvent) => void;
        onMouseEnter: (e: globalThis.MouseEvent) => void;
        onMouseLeaveCanvas: (e: globalThis.MouseEvent) => void;
    };

    // ResizeObserver 用于监听容器尺寸变化
    private resizeObserver: ResizeObserver | null = null;

    // 事件管理器
    private eventManager: EventManager;
    
    // 记录当前鼠标下的元素（用于 mouseenter/mouseleave）
    private lastMouseOverNode: Node | null = null;
    private lastMouseOverEdge: Edge | null = null;
    private lastMouseOverPort: Port | null = null;
    private isMouseOverCanvas: boolean = false;
    
    // 已注册的插件
    private plugins: Map<string, Plugin> = new Map();

    // 记录待取消选中的节点（用于延迟触发 node:unselected 事件）
    private nodeToUnselect: Node | null = null;

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
            validateConnection: () => true, // 默认允许所有连接
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

        // 初始化事件管理器
        this.eventManager = new EventManager();

        // 创建画布元素
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d')!;

        // 创建 overlay 层
        this.overlay = this.createOverlay();

        // 创建边线层（在 HTML 节点上方）
        this.edgeCanvas = this.createEdgeCanvas();
        this.edgeCtx = this.edgeCanvas.getContext('2d')!;

        // 绑定事件处理器
        this.boundHandlers = {
            onMouseDown: this.handleMouseDown.bind(this),
            onMouseMove: this.handleMouseMove.bind(this),
            onMouseUp: this.handleMouseUp.bind(this),
            onMouseLeave: this.handleMouseLeave.bind(this),
            onWheel: this.handleWheel.bind(this),
            onResize: this.handleResize.bind(this),
            onClick: this.handleClick.bind(this),
            onDblClick: this.handleDblClick.bind(this),
            onContextMenu: this.handleContextMenu.bind(this),
            onMouseEnter: (e: globalThis.MouseEvent) => this.handleMouseEnterLeave(e, true),
            onMouseLeaveCanvas: (e: globalThis.MouseEvent) => this.handleMouseEnterLeave(e, false),
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
      position: relative;
      z-index: 1;
    `;
        return canvas;
    }

    /**
     * 创建 Overlay 层用于放置 HTML 节点
     */
    private createOverlay(): HTMLDivElement {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 2;
    `;
        return overlay;
    }

    /**
     * 创建边线层 Canvas（在 HTML 节点上方）
     */
    private createEdgeCanvas(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 3;
    `;
        return canvas;
    }

    /**
     * 获取 Overlay 层
     */
    getOverlay(): HTMLDivElement {
        return this.overlay;
    }

    /**
     * 添加 HTML 节点元素到 Overlay
     */
    addHtmlNodeElement(nodeId: string, element: HTMLElement): void {
        this.htmlNodeElements.set(nodeId, element);
        // 确保 HTML 节点可以接收鼠标事件
        element.style.pointerEvents = 'auto';
        this.overlay.appendChild(element);
    }

    /**
     * 移除 HTML 节点元素
     */
    removeHtmlNodeElement(nodeId: string): void {
        const element = this.htmlNodeElements.get(nodeId);
        if (element && element.parentNode === this.overlay) {
            this.overlay.removeChild(element);
        }
        this.htmlNodeElements.delete(nodeId);
    }

    /**
     * 获取 HTML 节点元素
     */
    getHtmlNodeElement(nodeId: string): HTMLElement | undefined {
        return this.htmlNodeElements.get(nodeId);
    }

    /**
     * 更新 HTML 节点的位置和变换
     */
    updateHtmlNodeTransform(node: Node): void {
        const element = this.htmlNodeElements.get(node.getId());
        if (element) {
            const pos = node.getPosition();
            const { offset, scale } = this.state;
            // 计算屏幕坐标 = 世界坐标 * 缩放 + 偏移
            const screenX = pos.x * scale + offset.x;
            const screenY = pos.y * scale + offset.y;
            // CSS transform 从右到左执行：
            // 1. translate(-50%, -50%) 将元素中心移到原点
            // 2. scale(scale) 缩放元素
            // 3. translate(screenX, screenY) 移动到目标屏幕位置
            element.style.transform = `translate(${screenX}px, ${screenY}px) scale(${scale}) translate(-50%, -50%)`;
        }
    }

    /**
     * 同步所有 HTML 节点的位置和变换
     */
    syncHtmlNodeTransforms(): void {
        // 只更新 HTML 节点的位置，而不是所有节点
        this.htmlNodeElements.forEach((element, nodeId) => {
            const node = this.nodes.get(nodeId);
            if (node) {
                this.updateHtmlNodeTransform(node);
            }
        });
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

        // 添加画布到容器（底层：网格和节点）
        this.container.appendChild(this.canvas);
        
        // 添加 overlay 层到容器（中层：HTML 节点）
        this.container.appendChild(this.overlay);

        // 添加边线层到容器（顶层：边线，在 HTML 节点上方）
        this.container.appendChild(this.edgeCanvas);

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
        // 使用 requestAnimationFrame 避免 ResizeObserver loop 错误
        requestAnimationFrame(() => {
            if (!this.container || !this.canvas) return;
            
            const rect = this.container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            // 调整主画布尺寸
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.canvas.style.width = `${rect.width}px`;
            this.canvas.style.height = `${rect.height}px`;

            // 调整边线层画布尺寸
            this.edgeCanvas.width = rect.width * dpr;
            this.edgeCanvas.height = rect.height * dpr;
            this.edgeCanvas.style.width = `${rect.width}px`;
            this.edgeCanvas.style.height = `${rect.height}px`;

            // 重置变换矩阵并设置上下文缩放以适应 DPR
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this.edgeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

            this.render();
        });
    }

    /**
     * 绑定事件
     */
    private bindEvents(): void {
        if (this.options.draggable) {
            this.canvas.addEventListener('mousedown', this.boundHandlers.onMouseDown);
            // 给 overlay 也添加 mousedown 监听，支持 HTML 节点拖拽
            this.overlay.addEventListener('mousedown', this.boundHandlers.onMouseDown);
            document.addEventListener('mousemove', this.boundHandlers.onMouseMove);
            document.addEventListener('mouseup', this.boundHandlers.onMouseUp);
            this.canvas.addEventListener(
                'mouseleave',
                this.boundHandlers.onMouseLeave
            );
            // 给 overlay 添加 mousemove 监听，确保在 HTML 节点上移动时也能更新连接预览线
            this.overlay.addEventListener('mousemove', this.boundHandlers.onMouseMove);
        }

        if (this.options.scalable) {
            this.canvas.addEventListener('wheel', this.boundHandlers.onWheel, {
                passive: false,
            });
        }

        // 添加 click、dblclick、contextmenu 事件监听
        this.canvas.addEventListener('click', this.boundHandlers.onClick);
        this.canvas.addEventListener('dblclick', this.boundHandlers.onDblClick);
        this.canvas.addEventListener('contextmenu', this.boundHandlers.onContextMenu);

        window.addEventListener('resize', this.boundHandlers.onResize);

        // 使用 ResizeObserver 监听容器尺寸变化（用于 Splitter 等场景）
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => {
                this.handleResize();
            });
            this.resizeObserver.observe(this.container);
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
        this.overlay.removeEventListener(
            'mousedown',
            this.boundHandlers.onMouseDown
        );
        document.removeEventListener('mousemove', this.boundHandlers.onMouseMove);
        document.removeEventListener('mouseup', this.boundHandlers.onMouseUp);
        this.overlay.removeEventListener('mousemove', this.boundHandlers.onMouseMove);
        this.canvas.removeEventListener(
            'mouseleave',
            this.boundHandlers.onMouseLeave
        );
        this.canvas.removeEventListener('wheel', this.boundHandlers.onWheel);
        window.removeEventListener('resize', this.boundHandlers.onResize);

        // 移除 click、dblclick、contextmenu 监听器
        this.canvas.removeEventListener('click', this.boundHandlers.onClick);
        this.canvas.removeEventListener('dblclick', this.boundHandlers.onDblClick);
        this.canvas.removeEventListener('contextmenu', this.boundHandlers.onContextMenu);

        // 断开 ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }

    /**
     * 鼠标按下处理
     */
    private handleMouseDown(e: globalThis.MouseEvent): void {
        if (!this.options.draggable) return;

        // 检查是否点击了表单元素，如果是则不拖拽
        const target = e.target as HTMLElement;
        const isFormElement = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName) ||
                              target.isContentEditable;
        
        if (isFormElement) {
            // 点击表单元素时不拖拽，但允许事件继续传播
            return;
        }

        // 检查点击目标是否在当前 graph 容器内
        const targetElement = e.target as HTMLElement;
        if (!this.container.contains(targetElement) && targetElement !== this.container) {
            return;
        }

        e.preventDefault();

        // 将鼠标位置转换为世界坐标（使用容器的坐标系）
        const rect = this.container.getBoundingClientRect();
        const screenPoint: Point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        const worldPoint = this.screenToWorld(screenPoint);

        // 检查点击目标（一次遍历）
        const nodes = this.getAllNodes();
        let clickedNode: Node | null = null;
        let clickedPort: Port | null = null;
        
        for (let i = nodes.length - 1; i >= 0; i--) {
            // 先检查连接桩
            const port = nodes[i].getPortAtPoint(worldPoint);
            if (port) {
                clickedPort = port;
                clickedNode = nodes[i];
                break;
            }
            
            // 再检查节点主体
            if (nodes[i].containsPoint(worldPoint)) {
                clickedNode = nodes[i];
                break;
            }
        }

        // 分发 mousedown 事件（复用已检测的结果）
        this.dispatchMouseEventWithTarget('mousedown', e, worldPoint, clickedNode, clickedPort);

        // 如果点击了连接桩，开始连接拖拽
        if (clickedPort && clickedNode) {
            this.startConnection(clickedNode, clickedPort, worldPoint);
            return;
        }

        if (clickedNode) {
            // 开始拖拽节点
            this.draggedNode = clickedNode;
            this.isDraggingNode = true;
            this.dragStartPosition = { ...screenPoint };
            const nodePos = clickedNode.getPosition();
            this.dragNodeStartPosition = { ...nodePos };
            
            // 选中节点（延迟触发 node:unselected 事件，在 mouseup 时触发）
            this.selectNode(clickedNode.getId(), false);
            
            // 触发 node:dragstart 事件
            clickedNode.triggerNodeEvent('dragstart', e, { x: worldPoint.x, y: worldPoint.y });
            this.emit(EVENT_NAMES.NODE_DRAGSTART, {
                type: 'node',
                target: clickedNode,
                node: clickedNode,
                originalEvent: e,
                x: worldPoint.x,
                y: worldPoint.y,
            });
            
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
     * 开始连接拖拽
     */
    private startConnection(sourceNode: Node, sourcePort: Port, startPoint: Point): void {
        this.isConnecting = true;
        this.connectSourceNode = sourceNode;
        this.connectSourcePort = sourcePort;
        this.connectCurrentPoint = startPoint;
        this.connectTargetNode = null;
        this.connectTargetPort = null;
        
        this.canvas.style.cursor = 'crosshair';
        
        // 禁用所有 HTML 节点的鼠标事件捕获，使鼠标事件能够穿透到 overlay 层
        // 这样在连接拖拽时，鼠标经过 HTML 节点也不会中断连接线的更新
        this.htmlNodeElements.forEach((element) => {
            element.style.pointerEvents = 'none';
        });
        
        this.scheduleRender();
    }

    /**
     * 更新连接目标
     */
    private updateConnectionTarget(worldPoint: Point): void {
        if (!this.isConnecting) return;

        this.connectCurrentPoint = worldPoint;

        // 查找当前鼠标下的连接桩
        let targetPort: Port | null = null;
        let targetNode: Node | null = null;

        const nodes = this.getAllNodes();
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            // 跳过源节点
            if (node === this.connectSourceNode) continue;

            const port = node.getPortAtPoint(worldPoint);
            if (port) {
                targetPort = port;
                targetNode = node;
                break;
            }
        }

        // 吸附逻辑：如果鼠标不在连接桩上，检查是否在吸附范围内
        if (!targetPort) {
            let closestPort: Port | null = null;
            let closestNode: Node | null = null;
            let minDistance = Infinity;

            for (const node of nodes) {
                // 跳过源节点
                if (node === this.connectSourceNode) continue;

                const nodePos = node.getPosition();
                const nodeStyle = node.getStyle();

                // 获取节点的所有连接桩
                const ports = node.getAllPorts ? node.getAllPorts() : [];

                for (const port of ports) {
                    const distance = port.getDistanceToPoint(
                        worldPoint,
                        nodePos.x,
                        nodePos.y,
                        nodeStyle.width,
                        nodeStyle.height
                    );
                    const snapDistance = port.getSnapDistance();

                    // 如果距离小于吸附距离且比之前找到的更近
                    if (distance <= snapDistance && distance < minDistance) {
                        minDistance = distance;
                        closestPort = port;
                        closestNode = node;
                    }
                }
            }

            if (closestPort && closestNode) {
                targetPort = closestPort;
                targetNode = closestNode;
                // 吸附时，将当前点设置为连接桩的位置
                const nodePos = targetNode.getPosition();
                const nodeStyle = targetNode.getStyle();
                this.connectCurrentPoint = targetPort.getConnectionPoint(
                    nodePos.x,
                    nodePos.y,
                    nodeStyle.width,
                    nodeStyle.height
                );
            }
        }

        // 如果目标变化，更新状态
        if (targetPort !== this.connectTargetPort) {
            this.connectTargetPort = targetPort;
            this.connectTargetNode = targetNode;
        }

        this.scheduleRender();
    }

    /**
     * 完成连接
     */
    private completeConnection(): void {
        if (!this.isConnecting) return;

        // 如果有有效的目标连接桩，创建边
        if (this.connectSourceNode && this.connectSourcePort &&
            this.connectTargetNode && this.connectTargetPort) {
            
            // 调用连接验证函数
            const validateResult = this.options.validateConnection({
                sourceNode: this.connectSourceNode,
                sourcePort: this.connectSourcePort,
                targetNode: this.connectTargetNode,
                targetPort: this.connectTargetPort,
            });
            
            // 如果验证失败，不创建边
            if (!validateResult) {
                this.resetConnection();
                return;
            }
            
            this.addEdge({
                id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                source: {
                    nodeId: this.connectSourceNode.getId(),
                    portId: this.connectSourcePort.getId(),
                },
                target: {
                    nodeId: this.connectTargetNode.getId(),
                    portId: this.connectTargetPort.getId(),
                },
                type: EdgeType.Straight,
            });
        }

        this.resetConnection();
    }

    /**
     * 取消连接
     */
    private cancelConnection(): void {
        this.resetConnection();
    }

    /**
     * 重置连接状态
     */
    private resetConnection(): void {
        this.isConnecting = false;
        this.connectSourceNode = null;
        this.connectSourcePort = null;
        this.connectTargetNode = null;
        this.connectTargetPort = null;
        this.connectCurrentPoint = { x: 0, y: 0 };
        this.canvas.style.cursor = 'grab';
        
        // 恢复所有 HTML 节点的鼠标事件捕获
        this.htmlNodeElements.forEach((element) => {
            element.style.pointerEvents = 'auto';
        });
        
        this.scheduleRender();
    }

    /**
     * 鼠标移动处理
     */
    private handleMouseMove(e: globalThis.MouseEvent): void {
        // 处理连接拖拽
        if (this.isConnecting) {
            const rect = this.canvas.getBoundingClientRect();
            const screenPoint: Point = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
            const worldPoint = this.screenToWorld(screenPoint);
            
            this.updateConnectionTarget(worldPoint);
            return;
        }

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
            
            // 触发 node:drag 事件
            this.draggedNode.triggerNodeEvent('drag', e, { x: newX, y: newY });
            this.emit(EVENT_NAMES.NODE_DRAG, {
                type: 'node',
                target: this.draggedNode,
                node: this.draggedNode,
                originalEvent: e,
                x: newX,
                y: newY,
            });
            
            this.scheduleRender();
            return;
        }

        // 处理画布拖拽
        if (this.state.isDragging && this.state.lastMousePosition) {
            const deltaX = e.clientX - this.state.lastMousePosition.x;
            const deltaY = e.clientY - this.state.lastMousePosition.y;

            this.state.offset.x += deltaX;
            this.state.offset.y += deltaY;

            this.state.lastMousePosition = {
                x: e.clientX,
                y: e.clientY,
            };

            this.scheduleRender();
            return;
        }

        // 处理鼠标悬停状态（非拖拽状态下）
        this.handleMouseEnterLeave(e, true);

        // 处理 DynamicHeightNode 的行悬停状态
        this.handleDynamicNodeRowHover(e);
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
     * 点击事件处理
     */
    private handleClick(e: globalThis.MouseEvent): void {
        this.dispatchMouseEvent('click', e);
    }

    /**
     * 双击事件处理
     */
    private handleDblClick(e: globalThis.MouseEvent): void {
        this.dispatchMouseEvent('dblclick', e);
    }

    /**
     * 右键菜单事件处理
     */
    private handleContextMenu(e: globalThis.MouseEvent): void {
        e.preventDefault();
        this.dispatchMouseEvent('contextmenu', e);
    }

    /**
     * 鼠标释放处理
     */
    private handleMouseUp(e: globalThis.MouseEvent): void {
        // 将鼠标位置转换为世界坐标
        const rect = this.canvas.getBoundingClientRect();
        const screenPoint: Point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        const worldPoint = this.screenToWorld(screenPoint);

        // 处理连接拖拽结束
        if (this.isConnecting) {
            this.completeConnection();
            return;
        }

        // 处理节点拖拽结束
        if (this.isDraggingNode && this.draggedNode) {
            // 触发 node:dragend 事件
            const finalPosition = this.draggedNode.getPosition();
            this.draggedNode.triggerNodeEvent('dragend', e, { x: finalPosition.x, y: finalPosition.y });
            this.emit(EVENT_NAMES.NODE_DRAGEND, {
                type: 'node',
                target: this.draggedNode,
                node: this.draggedNode,
                originalEvent: e,
                x: finalPosition.x,
                y: finalPosition.y,
            });

            // 触发延迟的 node:unselected 事件（如果有）
            if (this.nodeToUnselect) {
                this.triggerNodeUnselected(this.nodeToUnselect, worldPoint.x, worldPoint.y, e);
                this.nodeToUnselect = null;
            }

            this.isDraggingNode = false;
            this.draggedNode = null;
            this.canvas.style.cursor = 'grab';
            return;
        }

        // 分发 mouseup 事件
        this.dispatchMouseEvent('mouseup', e);

        // 处理画布拖拽结束
        if (!this.state.isDragging) {
            return;
        }

        this.state.isDragging = false;
        this.state.lastMousePosition = null;
        this.canvas.style.cursor = 'grab';

        // 触发拖拽完成回调
        this.options.onDragEnd({ ...this.state.offset });
    }

    /**
     * 鼠标离开处理
     */
    private handleMouseLeave(e: globalThis.MouseEvent): void {
        // 如果正在连接，取消连接
        if (this.isConnecting) {
            this.cancelConnection();
            return;
        }

        if (this.state.isDragging) {
            this.handleMouseUp(e);
        }
        
        // 触发 mouseleave 事件
        this.handleMouseEnterLeave(e, false);
        
        // 清除所有悬停状态
        if (this.hoveredNode) {
            this.hoveredNode.setHovered(false);
            this.hoveredNode = null;
        }
        if (this.hoveredEdge) {
            this.hoveredEdge.setHovered(false);
            this.hoveredEdge = null;
            this.scheduleRender();
        }
    }

    /**
     * 滚轮缩放处理
     */
    private handleWheel(e: WheelEvent): void {
        if (!this.options.scalable) return;

        (e as globalThis.WheelEvent).preventDefault();

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // 计算缩放前鼠标在世界坐标系中的位置
        const worldX = (mouseX - this.state.offset.x) / this.state.scale;
        const worldY = (mouseY - this.state.offset.y) / this.state.scale;

        // 检查鼠标是否在空白区域
        const worldPoint: Point = { x: worldX, y: worldY };
        let isOnElement = false;

        // 检查是否在节点上
        const nodes = this.getAllNodes();
        for (let i = nodes.length - 1; i >= 0; i--) {
            if (nodes[i].containsPoint(worldPoint)) {
                isOnElement = true;
                break;
            }
        }

        // 如果不在节点上，检查是否在边上
        if (!isOnElement) {
            const edges = this.getAllEdges();
            for (let i = edges.length - 1; i >= 0; i--) {
                if (edges[i].containsPoint(worldPoint)) {
                    isOnElement = true;
                    break;
                }
            }
        }

        // 如果在空白区域，触发 blank:mousewheel 事件
        if (!isOnElement) {
            this.dispatchMouseEvent('mousewheel', e as globalThis.WheelEvent);
        }

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
    scheduleRender(): void {
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

        // 清空主画布
        this.ctx.clearRect(0, 0, width, height);

        // 清空边线层画布
        this.edgeCtx.clearRect(0, 0, width, height);

        // 保存当前上下文状态
        this.ctx.save();
        this.edgeCtx.save();

        // 应用变换
        this.ctx.translate(this.state.offset.x, this.state.offset.y);
        this.ctx.scale(this.state.scale, this.state.scale);
        this.edgeCtx.translate(this.state.offset.x, this.state.offset.y);
        this.edgeCtx.scale(this.state.scale, this.state.scale);

        // 绘制背景
        this.drawBackground();

        // 绘制网格
        if (this.options.grid.enabled) {
            this.drawGrid(width, height);
        }

        // 绘制所有节点（在主画布上）
        this.renderNodes();

        // 绘制所有边（在边线层上，位于 HTML 节点上方）
        this.renderEdges();

        // 绘制连接中的临时连线（在边线层上）
        this.renderConnectingEdge();

        // 恢复上下文状态
        this.ctx.restore();
        this.edgeCtx.restore();

        // 同步 HTML 节点的位置和缩放
        this.syncHtmlNodeTransforms();

        // 触发自定义绘制
        this.onRender();
    }

    /**
     * 绘制连接中的临时连线
     */
    private renderConnectingEdge(): void {
        if (!this.isConnecting || !this.connectSourceNode || !this.connectSourcePort) {
            return;
        }

        const sourcePoint = this.connectSourcePort.getConnectionPoint(
            this.connectSourceNode.getPosition().x,
            this.connectSourceNode.getPosition().y,
            this.connectSourceNode.getStyle().width,
            this.connectSourceNode.getStyle().height
        );

        const targetPoint = this.connectCurrentPoint;

        // 使用边线层画布绘制临时连线
        this.edgeCtx.save();

        // 设置虚线样式
        this.edgeCtx.strokeStyle = this.connectTargetPort ? '#3b82f6' : '#94a3b8';
        this.edgeCtx.lineWidth = 2;
        this.edgeCtx.lineCap = 'round';
        this.edgeCtx.setLineDash([5, 5]);

        // 绘制直线
        this.edgeCtx.beginPath();
        this.edgeCtx.moveTo(sourcePoint.x, sourcePoint.y);
        this.edgeCtx.lineTo(targetPoint.x, targetPoint.y);
        this.edgeCtx.stroke();

        // 如果有目标连接桩，高亮显示
        if (this.connectTargetPort && this.connectTargetNode) {
            const portPos = this.connectTargetPort.getConnectionPoint(
                this.connectTargetNode.getPosition().x,
                this.connectTargetNode.getPosition().y,
                this.connectTargetNode.getStyle().width,
                this.connectTargetNode.getStyle().height
            );

            // 绘制目标点高亮圈
            this.edgeCtx.beginPath();
            this.edgeCtx.arc(portPos.x, portPos.y, 8, 0, Math.PI * 2);
            this.edgeCtx.fillStyle = 'rgba(59, 130, 246, 0.2)';
            this.edgeCtx.fill();
            this.edgeCtx.strokeStyle = '#3b82f6';
            this.edgeCtx.lineWidth = 2;
            this.edgeCtx.setLineDash([]);
            this.edgeCtx.stroke();
        }

        this.edgeCtx.restore();
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
     * @param nodeOrOptions - 节点配置或节点实例
     * @returns 节点实例
     */
    addNode(nodeOrOptions: NodeOptions | Node): Node {
        const node = nodeOrOptions instanceof Node
            ? nodeOrOptions
            : new Node(nodeOrOptions);
        this.nodes.set(node.getId(), node);
        
        // 如果是 HTML 节点，创建 DOM 元素
        if (node.isHtmlNode()) {
            node.createHtmlElement(this);
            this.updateHtmlNodeTransform(node);
        }
        
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
            // 如果移除的是选中的节点，触发 unselected 事件并取消选中
            if (this.selectedNode === node) {
                // 触发 node:unselected 事件
                this.selectedNode.emit(EVENT_NAMES.NODE_UNSELECTED, {
                    type: 'node',
                    target: this.selectedNode,
                    node: this.selectedNode,
                });
                this.emit(EVENT_NAMES.NODE_UNSELECTED, {
                    type: 'node',
                    target: this.selectedNode,
                    node: this.selectedNode,
                });
                this.selectedNode = null;
                this.options.onNodeSelect(null);
            }
            // 如果是 HTML 节点，移除其 DOM 元素
            if (node.isHtmlNode()) {
                this.removeHtmlNodeElement(nodeId);
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
     * @param triggerUnselectImmediately - 是否立即触发 node:unselected 事件，默认为 true
     *                                     如果为 false，则在鼠标松开时触发
     */
    selectNode(nodeId: string | null, triggerUnselectImmediately: boolean = true): void {
        // 取消之前的选中
        if (this.selectedNode) {
            this.selectedNode.setSelected(false);

            if (triggerUnselectImmediately) {
                // 立即触发 node:unselected 事件
                this.selectedNode.emit(EVENT_NAMES.NODE_UNSELECTED, {
                    type: 'node',
                    target: this.selectedNode,
                    node: this.selectedNode,
                });
                this.emit(EVENT_NAMES.NODE_UNSELECTED, {
                    type: 'node',
                    target: this.selectedNode,
                    node: this.selectedNode,
                });
            } else {
                // 记录待取消选中的节点，延迟到鼠标松开时触发
                this.nodeToUnselect = this.selectedNode;
            }
        }

        if (nodeId) {
            const node = this.nodes.get(nodeId);
            if (node) {
                node.setSelected(true);
                this.selectedNode = node;
                // 触发 node:selected 事件
                node.emit(EVENT_NAMES.NODE_SELECTED, {
                    type: 'node',
                    target: node,
                    node: node,
                });
                this.emit(EVENT_NAMES.NODE_SELECTED, {
                    type: 'node',
                    target: node,
                    node: node,
                });
            }
        } else {
            this.selectedNode = null;
        }

        this.options.onNodeSelect(this.selectedNode);
        this.scheduleRender();
    }

    /**
     * 触发 node:unselected 事件（用于延迟触发）
     * @param node - 要触发 unselected 事件的节点
     */
    private triggerNodeUnselected(node: Node, x: number, y: number, originalEvent: globalThis.MouseEvent): void {
        const eventData = {
            type: 'node',
            target: node,
            node: node,
            x,
            y,
            originalEvent,
        };
        node.emit(EVENT_NAMES.NODE_UNSELECTED, eventData);
        this.emit(EVENT_NAMES.NODE_UNSELECTED, eventData);
    }

    /**
     * 清除所有节点
     */
    clearNodes(): void {
        // 如果有选中的节点，触发 unselected 事件
        if (this.selectedNode) {
            this.selectedNode.emit(EVENT_NAMES.NODE_UNSELECTED, {
                type: 'node',
                target: this.selectedNode,
                node: this.selectedNode,
            });
            this.emit(EVENT_NAMES.NODE_UNSELECTED, {
                type: 'node',
                target: this.selectedNode,
                node: this.selectedNode,
            });
            this.selectedNode = null;
        }
        // 清除所有 HTML 节点的 DOM 元素
        this.htmlNodeElements.forEach((element, nodeId) => {
            if (element.parentNode === this.overlay) {
                this.overlay.removeChild(element);
            }
        });
        this.htmlNodeElements.clear();
        this.nodes.clear();
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

                edge.draw(this.edgeCtx, sourcePoint, targetPoint);
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
     * 重置到画布中心点
     * 将视图移动到画布中心，保持当前缩放比例
     */
    resetToCenter(): void {
        const { width, height } = this.canvas.getBoundingClientRect();
        
        this.state.offset = {
            x: width / 2,
            y: height / 2,
        };
        this.render();
        
        // 触发拖拽完成回调
        this.options.onDragEnd({ ...this.state.offset });
    }

    /**
     * 放大画布
     * @param factor - 缩放因子，默认为 1.1
     */
    zoomIn(factor: number = 1.1): void {
        const newScale = Math.min(
            this.options.maxZoom,
            this.state.scale * factor
        );
        this.setScale(newScale);
    }

    /**
     * 缩小画布
     * @param factor - 缩放因子，默认为 0.9
     */
    zoomOut(factor: number = 0.9): void {
        const newScale = Math.max(
            this.options.minZoom,
            this.state.scale * factor
        );
        this.setScale(newScale);
    }

    /**
     * 获取当前缩放比例
     * @returns 当前缩放比例
     */
    getZoom(): number {
        return this.state.scale;
    }

    /**
     * 设置网格大小
     * @param size - 网格大小（像素）
     */
    setGridSize(size: number): void {
        this.options.grid.size = size;
        this.scheduleRender();
    }

    /**
     * 设置网格颜色
     * @param color - 网格颜色（CSS 颜色值）
     */
    setGridColor(color: string): void {
        this.options.grid.color = color;
        this.scheduleRender();
    }

    /**
     * 启用或禁用网格
     * @param enabled - 是否启用网格
     */
    setGridEnabled(enabled: boolean): void {
        this.options.grid.enabled = enabled;
        this.scheduleRender();
    }

    /**
     * 获取网格配置
     * @returns 当前网格配置
     */
    getGridConfig(): { enabled: boolean; size: number; color: string } {
        return {
            enabled: this.options.grid.enabled,
            size: this.options.grid.size ?? 20,
            color: this.options.grid.color ?? '#e5e7eb',
        };
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
     * 将图导出为 JSON 格式
     * @returns 包含 cells 数组的对象，cells 按渲染顺序排列（先边后节点）
     */
    toJSON(): { cells: Array<ReturnType<Node['toJSON']> | ReturnType<Edge['toJSON']>> } {
        const cells: Array<ReturnType<Node['toJSON']> | ReturnType<Edge['toJSON']>> = [];

        // 先添加所有边（边在节点下方渲染）
        this.edges.forEach((edge) => {
            cells.push(edge.toJSON());
        });

        // 再添加所有节点（节点在边上方渲染）
        this.nodes.forEach((node) => {
            cells.push(node.toJSON());
        });

        return { cells };
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

        // 解绑事件（包含 ResizeObserver 的清理）
        this.unbindEvents();

        // 移除画布元素
        if (this.canvas.parentNode === this.container) {
            this.container.removeChild(this.canvas);
        }

        // 移除 overlay 层
        if (this.overlay.parentNode === this.container) {
            this.container.removeChild(this.overlay);
        }

        // 移除边线层
        if (this.edgeCanvas.parentNode === this.container) {
            this.container.removeChild(this.edgeCanvas);
        }

        // 清空 HTML 节点元素
        this.htmlNodeElements.clear();

        // 清空引用
        (this as any).container = null;
        (this as any).canvas = null;
        (this as any).ctx = null;
        (this as any).overlay = null;
        (this as any).edgeCanvas = null;
        (this as any).edgeCtx = null;

        // 清理事件管理器
        this.eventManager.clear();
    }

    // ==================== 事件系统 ====================

    /**
     * 注册事件处理器
     * @param eventName - 事件名称
     * @param handler - 事件处理器
     * @returns 注销函数
     */
    on(eventName: string, handler: EventHandler): () => void {
        return this.eventManager.on(eventName, handler);
    }

    /**
     * 注册一次性事件处理器
     * @param eventName - 事件名称
     * @param handler - 事件处理器
     * @returns 注销函数
     */
    once(eventName: string, handler: EventHandler): () => void {
        return this.eventManager.once(eventName, handler);
    }

    /**
     * 注销事件处理器
     * @param eventName - 事件名称
     * @param handler - 要注销的处理器（不传则注销该事件的所有处理器）
     */
    off(eventName: string, handler?: EventHandler): void {
        this.eventManager.off(eventName, handler);
    }

    /**
     * 触发 Graph 级别事件
     */
    private emit(eventName: string, eventData: any): boolean {
        return this.eventManager.emit(eventName, eventData);
    }

    /**
     * 创建基础鼠标事件对象
     */
    private createMouseEvent(
        originalEvent: globalThis.MouseEvent | globalThis.WheelEvent,
        target: any,
        extraData: Partial<BaseEvent> = {}
    ): MouseEvent {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = originalEvent.clientX - rect.left;
        const screenY = originalEvent.clientY - rect.top;
        const worldPoint = this.screenToWorld({ x: screenX, y: screenY });

        return {
            type: 'mouse',
            target,
            originalEvent,
            x: worldPoint.x,
            y: worldPoint.y,
            clientX: originalEvent.clientX,
            clientY: originalEvent.clientY,
            ctrlKey: originalEvent.ctrlKey,
            shiftKey: originalEvent.shiftKey,
            altKey: originalEvent.altKey,
            metaKey: originalEvent.metaKey,
            button: originalEvent.button,
            stopPropagation: () => originalEvent.stopPropagation(),
            preventDefault: () => originalEvent.preventDefault(),
            ...extraData,
        };
    }

    /**
     * 创建滚轮事件对象
     */
    private createWheelEvent(
        originalEvent: globalThis.WheelEvent,
        target: any
    ): WheelEvent {
        const mouseEvent = this.createMouseEvent(originalEvent, target);
        return {
            ...mouseEvent,
            deltaX: originalEvent.deltaX,
            deltaY: originalEvent.deltaY,
            deltaZ: originalEvent.deltaZ,
            deltaMode: originalEvent.deltaMode,
        };
    }

    /**
     * 分发鼠标事件到对应的元素
     */
    private dispatchMouseEvent(
        eventType: string,
        originalEvent: globalThis.MouseEvent
    ): void {
        const rect = this.canvas.getBoundingClientRect();
        const screenPoint: Point = {
            x: originalEvent.clientX - rect.left,
            y: originalEvent.clientY - rect.top,
        };
        const worldPoint = this.screenToWorld(screenPoint);

        // 调用带目标检测的版本
        this.dispatchMouseEventWithTarget(eventType, originalEvent, worldPoint, null, null);
    }

    /**
     * 分发鼠标事件（带已知目标，避免重复遍历）
     */
    private dispatchMouseEventWithTarget(
        eventType: string,
        originalEvent: globalThis.MouseEvent,
        worldPoint: Point,
        knownNode: Node | null,
        knownPort: Port | null
    ): void {
        // 创建基础事件数据
        const baseEventData = this.createMouseEvent(originalEvent, null);

        // 如果提供了已知的节点和连接桩，直接使用
        if (knownPort && knownNode) {
            const portEventData = {
                ...baseEventData,
                target: knownPort,
                port: knownPort,
                portId: knownPort.getId(),
                nodeId: knownNode.getId(),
            };
            knownPort.triggerPortEvent(eventType, originalEvent);
            this.emit(EVENT_NAMES[`PORT_${eventType.toUpperCase()}` as keyof typeof EVENT_NAMES], portEventData);
            return;
        }

        if (knownNode) {
            const nodeEventData = {
                ...baseEventData,
                target: knownNode,
                node: knownNode,
            };
            knownNode.triggerNodeEvent(eventType, originalEvent, { x: worldPoint.x, y: worldPoint.y });
            this.emit(EVENT_NAMES[`NODE_${eventType.toUpperCase()}` as keyof typeof EVENT_NAMES], nodeEventData);
            return;
        }

        // 没有已知目标，执行完整检测
        // 1. 检查节点和连接桩（一次遍历，优先级：连接桩 > 节点主体）
        const nodes = this.getAllNodes();
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            
            // 先检查连接桩
            const port = node.getPortAtPoint(worldPoint);
            if (port) {
                const portEventData = {
                    ...baseEventData,
                    target: port,
                    port,
                    portId: port.getId(),
                    nodeId: node.getId(),
                };
                port.triggerPortEvent(eventType, originalEvent);
                this.emit(EVENT_NAMES[`PORT_${eventType.toUpperCase()}` as keyof typeof EVENT_NAMES], portEventData);
                return;
            }
            
            // 再检查节点主体
            if (node.containsPoint(worldPoint)) {
                const nodeEventData = {
                    ...baseEventData,
                    target: node,
                    node,
                };
                node.triggerNodeEvent(eventType, originalEvent, { x: worldPoint.x, y: worldPoint.y });
                this.emit(EVENT_NAMES[`NODE_${eventType.toUpperCase()}` as keyof typeof EVENT_NAMES], nodeEventData);
                return;
            }
        }

        // 2. 检查边
        const edges = this.getAllEdges();
        for (let i = edges.length - 1; i >= 0; i--) {
            const edge = edges[i];
            if (edge.containsPoint(worldPoint)) {
                const edgeEventData = {
                    ...baseEventData,
                    target: edge,
                    edge,
                    sourceId: edge.getSourceId(),
                    targetId: edge.getTargetId(),
                };
                edge.triggerEdgeEvent(eventType, originalEvent, { x: worldPoint.x, y: worldPoint.y });
                this.emit(EVENT_NAMES[`EDGE_${eventType.toUpperCase()}` as keyof typeof EVENT_NAMES], edgeEventData);
                return;
            }
        }

        // 3. 空白区域 - 触发 blank 事件并取消选中
        const blankEventName = this.getBlankEventName(eventType);
        if (blankEventName) {
            const blankEventData = {
                ...baseEventData,
                target: null,
                x: worldPoint.x,
                y: worldPoint.y,
            };
            this.emit(blankEventName, blankEventData);

            // 如果是 mouseup 事件且有选中的节点，取消选中并触发 unselected 事件
            if (eventType === 'mouseup' && this.selectedNode) {
                const unselectedNode = this.selectedNode;
                unselectedNode.setSelected(false);

                // 优先使用延迟触发的节点（如果有）
                const nodeToTrigger = this.nodeToUnselect || unselectedNode;

                // 触发 node:unselected 事件
                const unselectedEventData = {
                    ...baseEventData,
                    type: 'node',
                    target: nodeToTrigger,
                    node: nodeToTrigger,
                    x: worldPoint.x,
                    y: worldPoint.y,
                };
                nodeToTrigger.emit(EVENT_NAMES.NODE_UNSELECTED, unselectedEventData);
                this.emit(EVENT_NAMES.NODE_UNSELECTED, unselectedEventData);

                this.selectedNode = null;
                this.nodeToUnselect = null; // 清除延迟触发标记
                this.options.onNodeSelect(null);
                this.scheduleRender();
            }

            // 如果是 mouseup 事件且有选中的边，取消选中
            if (eventType === 'mouseup' && this.selectedEdge) {
                this.selectedEdge.setSelected(false);
                this.selectedEdge = null;
                this.scheduleRender();
            }
        }
    }

    /**
     * 处理鼠标进入/离开事件
     */
    private handleMouseEnterLeave(
        originalEvent: globalThis.MouseEvent,
        isEnter: boolean
    ): void {
        const rect = this.canvas.getBoundingClientRect();
        const screenPoint: Point = {
            x: originalEvent.clientX - rect.left,
            y: originalEvent.clientY - rect.top,
        };
        const worldPoint = this.screenToWorld(screenPoint);
        const baseEventData = this.createMouseEvent(originalEvent, null);

        // 检查当前鼠标下的元素
        let currentNode: Node | null = null;
        let currentEdge: Edge | null = null;
        let currentPort: Port | null = null;

        const nodes = this.getAllNodes();
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            
            // 检查连接桩
            const port = node.getPortAtPoint(worldPoint);
            if (port) {
                currentPort = port;
                currentNode = node;
                break;
            }
            
            // 检查节点
            if (node.containsPoint(worldPoint)) {
                currentNode = node;
                break;
            }
        }

        // 如果没有在节点上，检查边
        if (!currentNode) {
            const edges = this.getAllEdges();
            for (let i = edges.length - 1; i >= 0; i--) {
                if (edges[i].containsPoint(worldPoint)) {
                    currentEdge = edges[i];
                    break;
                }
            }
        }

        // 处理 Port 的 mouseenter/mouseleave
        if (currentPort !== this.lastMouseOverPort) {
            // mouseleave port
            if (this.lastMouseOverPort) {
                const eventData = {
                    ...baseEventData,
                    target: this.lastMouseOverPort,
                    port: this.lastMouseOverPort,
                    portId: this.lastMouseOverPort.getId(),
                    nodeId: this.lastMouseOverPort.getNodeId(),
                };
                this.lastMouseOverPort.emit(EVENT_NAMES.PORT_MOUSELEAVE, eventData);
                this.emit(EVENT_NAMES.PORT_MOUSELEAVE, eventData);
                // 恢复光标：如果仍在节点上则显示 grab，否则显示 default
                this.canvas.style.cursor = currentNode ? 'grab' : 'default';
            }
            // mouseenter port
            if (currentPort) {
                const eventData = {
                    ...baseEventData,
                    target: currentPort,
                    port: currentPort,
                    portId: currentPort.getId(),
                    nodeId: currentNode?.getId() || '',
                };
                currentPort.emit(EVENT_NAMES.PORT_MOUSEENTER, eventData);
                this.emit(EVENT_NAMES.PORT_MOUSEENTER, eventData);
                // 设置为十字光标
                this.canvas.style.cursor = 'crosshair';
            }
            this.lastMouseOverPort = currentPort;
        }

        // 处理 Node 的 mouseenter/mouseleave
        if (currentNode !== this.lastMouseOverNode) {
            // 鼠标离开上一个节点（无论是从节点移到空白，还是从节点A移到节点B，或者鼠标离开canvas）
            if (this.lastMouseOverNode) {
                // 使用 triggerNodeEvent 确保同时触发 cell:mouseleave 和 node:mouseleave
                this.lastMouseOverNode.triggerNodeEvent('mouseleave', originalEvent, { x: worldPoint.x, y: worldPoint.y });
                const eventData = { ...baseEventData, target: this.lastMouseOverNode, node: this.lastMouseOverNode };
                this.emit(EVENT_NAMES.NODE_MOUSELEAVE, eventData);
                // 恢复默认光标（如果不在 Port 上）
                if (!currentPort) {
                    this.canvas.style.cursor = 'default';
                }
            }
            // 鼠标进入新节点
            if (currentNode) {
                // 使用 triggerNodeEvent 确保同时触发 cell:mouseenter 和 node:mouseenter
                currentNode.triggerNodeEvent('mouseenter', originalEvent, { x: worldPoint.x, y: worldPoint.y });
                const eventData = { ...baseEventData, target: currentNode, node: currentNode };
                this.emit(EVENT_NAMES.NODE_MOUSEENTER, eventData);
                // 设置为抓取光标（如果不在 Port 上）
                if (!currentPort) {
                    this.canvas.style.cursor = 'grab';
                }
            }
            this.lastMouseOverNode = currentNode;
        }

        // 处理 Edge 的 mouseenter/mouseleave
        if (currentEdge !== this.lastMouseOverEdge) {
            // mouseleave edge
            if (this.lastMouseOverEdge) {
                const eventData = { ...baseEventData, target: this.lastMouseOverEdge, edge: this.lastMouseOverEdge };
                this.lastMouseOverEdge.emit(EVENT_NAMES.EDGE_MOUSELEAVE, eventData);
                this.emit(EVENT_NAMES.EDGE_MOUSELEAVE, eventData);
            }
            // mouseenter edge
            if (currentEdge) {
                const eventData = { ...baseEventData, target: currentEdge, edge: currentEdge };
                currentEdge.emit(EVENT_NAMES.EDGE_MOUSEENTER, eventData);
                this.emit(EVENT_NAMES.EDGE_MOUSEENTER, eventData);
            }
            this.lastMouseOverEdge = currentEdge;
        }
    }

    /**
     * 检查事件名称映射
     */
    private getBlankEventName(eventType: string): string | null {
        const map: Record<string, string> = {
            click: EVENT_NAMES.BLANK_CLICK,
            contextmenu: EVENT_NAMES.BLANK_CONTEXTMENU,
        };
        return map[eventType] || null;
    }

    // ==================== 插件系统 ====================

    /**
     * 注册插件
     * @param plugin - 插件实例
     * @returns this（支持链式调用）
     */
    use(plugin: Plugin): this {
        if (this.plugins.has(plugin.name)) {
            console.warn(`Plugin "${plugin.name}" is already registered.`);
            return this;
        }
        
        this.plugins.set(plugin.name, plugin);
        plugin.install(this);
        
        return this;
    }

    /**
     * 注销插件
     * @param pluginName - 插件名称
     * @returns this（支持链式调用）
     */
    unuse(pluginName: string): this {
        const plugin = this.plugins.get(pluginName);
        if (plugin) {
            plugin.uninstall();
            this.plugins.delete(pluginName);
        }
        return this;
    }

    /**
     * 获取插件实例
     * @param pluginName - 插件名称
     * @returns 插件实例或 undefined
     */
    getPlugin<T extends Plugin>(pluginName: string): T | undefined {
        return this.plugins.get(pluginName) as T | undefined;
    }

    /**
     * 检查插件是否已注册
     * @param pluginName - 插件名称
     */
    hasPlugin(pluginName: string): boolean {
        return this.plugins.has(pluginName);
    }

    // ==================== DynamicHeightNode 行悬停处理 ====================

    private hoveredDynamicNode: DynamicHeightNode | null = null;
    private lastHoveredRowIndex: number = -1;

    /**
     * 处理 DynamicHeightNode 的行悬停状态
     */
    private handleDynamicNodeRowHover(e: globalThis.MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const screenPoint: Point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        const worldPoint = this.screenToWorld(screenPoint);

        // 查找鼠标下的 DynamicHeightNode
        let hoveredNode: DynamicHeightNode | null = null;
        const nodes = this.getAllNodes();
        
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            if (node instanceof DynamicHeightNode && node.containsPoint(worldPoint)) {
                hoveredNode = node;
                break;
            }
        }

        // 如果离开了之前的 DynamicHeightNode，清除其行悬停状态
        if (this.hoveredDynamicNode && this.hoveredDynamicNode !== hoveredNode) {
            this.hoveredDynamicNode.setHoveredRow(-1);
            this.scheduleRender();
        }

        this.hoveredDynamicNode = hoveredNode;

        // 如果在 DynamicHeightNode 上，计算悬停的行
        if (hoveredNode) {
            const rowIndex = hoveredNode.getRowIndexAtPoint(worldPoint);
            if (rowIndex !== this.lastHoveredRowIndex) {
                hoveredNode.setHoveredRow(rowIndex);
                this.lastHoveredRowIndex = rowIndex;
                this.scheduleRender();
            }
        } else {
            this.lastHoveredRowIndex = -1;
        }
    }
}

export default Graph;
