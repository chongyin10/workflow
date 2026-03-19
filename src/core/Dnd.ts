import { Node, NodeOptions } from './Node';
import { Graph, Point } from './Graph';
import { EventManager, type EventHandler } from './EventManager';

/**
 * Dnd 拖拽源配置
 */
export interface DndSourceOptions {
    /** 源 DOM 元素 */
    element: HTMLElement;
    /** 节点配置或生成函数 */
    node: NodeOptions | ((e: DragEvent) => NodeOptions);
    /** 拖拽开始回调 */
    onDragStart?: (e: DragEvent) => void;
    /** 拖拽结束回调 */
    onDragEnd?: (e: DragEvent) => void;
}

/**
 * Dnd 事件对象
 */
export interface DndEvent {
    /** 事件类型 */
    type: 'dnd:dragstart' | 'dnd:drag' | 'dnd:drop' | 'dnd:dragend' | 'dnd:dragenter' | 'dnd:dragover' | 'dnd:dragleave';
    /** 原始 DOM 事件 */
    originalEvent: DragEvent;
    /** 目标 Graph 实例 */
    target: Graph;
    /** 当前鼠标位置（世界坐标） */
    position: Point;
    /** 拖拽的节点配置 */
    nodeOptions?: NodeOptions;
    /** 拖拽预览元素 */
    dragElement?: HTMLElement;
}

/**
 * Dnd 配置选项
 */
export interface DndOptions {
    /** 目标 Graph 实例 */
    graph: Graph;
    /** 是否启用拖拽 */
    enabled?: boolean;
    /** 拖拽预览元素类名 */
    dragClassName?: string;
    /** 拖拽预览元素样式 */
    dragStyle?: Partial<CSSStyleDeclaration>;
    /** 是否使用 Canvas 绘制拖拽预览 */
    useCanvasPreview?: boolean;
    /** 拖拽预览节点样式（Canvas 模式） */
    previewNodeStyle?: Partial<NodeOptions['style']>;
    /** 拖拽开始回调 */
    onDragStart?: (e: DndEvent) => void;
    /** 拖拽中回调 */
    onDrag?: (e: DndEvent) => void;
    /** 放置回调（返回 false 可阻止放置） */
    onDrop?: (e: DndEvent) => boolean | void;
    /** 拖拽结束回调 */
    onDragEnd?: (e: DndEvent) => void;
    /** 拖拽进入画布回调 */
    onDragEnter?: (e: DndEvent) => void;
    /** 拖拽在画布上移动回调 */
    onDragOver?: (e: DndEvent) => void;
    /** 拖拽离开画布回调 */
    onDragLeave?: (e: DndEvent) => void;
    /** 是否验证放置位置（返回 false 阻止放置） */
    validateDrop?: (position: Point, nodeOptions: NodeOptions) => boolean;
    /** 放置节点前的转换函数 */
    transformNodeOptions?: (position: Point, nodeOptions: NodeOptions) => NodeOptions;
}

/**
 * Dnd - 拖拽插件
 *
 * 支持从外部拖拽节点到画布中，主要功能：
 * - 从 DOM 元素开始拖拽
 * - 拖拽预览（HTML 元素或 Canvas）
 * - 放置节点到画布
 * - 完整的事件系统
 *
 * 使用示例：
 * ```typescript
 * const dnd = new Dnd({
 *     graph: myGraph,
 *     enabled: true
 * });
 *
 * // 开始拖拽（从工具栏触发）
 * dnd.start(nodeOptions, dragEvent);
 * ```
 */
export class Dnd {
    private graph: Graph;
    private options: DndOptions;
    private eventManager: EventManager;
    private isDragging: boolean = false;
    private isDropped: boolean = false;  // 标记是否已成功放置
    private dragPreviewElement: HTMLElement | null = null;
    private currentNodeOptions: NodeOptions | null = null;
    private dropPosition: Point | null = null;
    private boundHandlers: {
        onDragOver: (e: DragEvent) => void;
        onDrop: (e: DragEvent) => void;
        onDragEnter: (e: DragEvent) => void;
        onDragLeave: (e: DragEvent) => void;
        onDragEnd: (e: DragEvent) => void;
    };

    // 默认配置
    private static readonly DEFAULT_OPTIONS: Pick<
        DndOptions,
        'enabled' | 'dragClassName' | 'dragStyle' | 'useCanvasPreview' | 'previewNodeStyle'
    > = {
        enabled: true,
        dragClassName: 'dnd-drag-preview',
        dragStyle: {
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: '9999',
            opacity: '0.8',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        },
        useCanvasPreview: false,
        previewNodeStyle: {
            backgroundColor: '#60a5fa',
            borderColor: '#3b82f6',
            borderWidth: 2,
        },
    };

    constructor(options: DndOptions) {
        this.graph = options.graph;
        this.options = {
            ...Dnd.DEFAULT_OPTIONS,
            ...options,
            dragStyle: {
                ...Dnd.DEFAULT_OPTIONS.dragStyle,
                ...options.dragStyle,
            },
            previewNodeStyle: {
                ...Dnd.DEFAULT_OPTIONS.previewNodeStyle,
                ...options.previewNodeStyle,
            },
        };
        this.eventManager = new EventManager();

        // 绑定事件处理器
        this.boundHandlers = {
            onDragOver: this.handleDragOver.bind(this),
            onDrop: this.handleDrop.bind(this),
            onDragEnter: this.handleDragEnter.bind(this),
            onDragLeave: this.handleDragLeave.bind(this),
            onDragEnd: this.handleDragEnd.bind(this),
        };

        // 如果启用，自动初始化
        if (this.options.enabled) {
            this.enable();
        }
    }

    /**
     * 启用拖拽功能
     */
    enable(): void {
        const canvas = this.graph.getCanvas();
        canvas.addEventListener('dragover', this.boundHandlers.onDragOver);
        canvas.addEventListener('drop', this.boundHandlers.onDrop);
        canvas.addEventListener('dragenter', this.boundHandlers.onDragEnter);
        canvas.addEventListener('dragleave', this.boundHandlers.onDragLeave);
        document.addEventListener('dragend', this.boundHandlers.onDragEnd);
    }

    /**
     * 禁用拖拽功能
     */
    disable(): void {
        const canvas = this.graph.getCanvas();
        canvas.removeEventListener('dragover', this.boundHandlers.onDragOver);
        canvas.removeEventListener('drop', this.boundHandlers.onDrop);
        canvas.removeEventListener('dragenter', this.boundHandlers.onDragEnter);
        canvas.removeEventListener('dragleave', this.boundHandlers.onDragLeave);
        document.removeEventListener('dragend', this.boundHandlers.onDragEnd);
    }

    /**
     * 开始拖拽
     * @param node - 节点配置选项或生成函数
     * @param e - 原始拖拽事件
     */
    start(node: NodeOptions | ((e: DragEvent) => NodeOptions), e: DragEvent): void {
        if (!this.options.enabled) return;

        // 清理之前的状态（如果有）
        this.cleanup();

        // 解析节点配置
        this.currentNodeOptions = typeof node === 'function' ? node(e) : { ...node };

        // 设置拖拽数据（用于浏览器原生拖拽）
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('application/json', JSON.stringify(this.currentNodeOptions));

            // 设置拖拽预览
            this.setupDragPreview(e);
        }

        this.isDragging = true;
        this.isDropped = false;

        // 触发拖拽开始事件
        const dndEvent = this.createDndEvent('dnd:dragstart', e);
        this.emit('dnd:dragstart', dndEvent);
        this.options.onDragStart?.(dndEvent);
    }

    /**
     * 设置拖拽预览
     */
    private setupDragPreview(e: DragEvent): void {
        if (!e.dataTransfer) return;

        if (this.options.useCanvasPreview) {
            // 使用 Canvas 绘制预览（简化版本）
            const canvas = document.createElement('canvas');
            canvas.width = 120;
            canvas.height = 60;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // 绘制简单的节点预览
                ctx.fillStyle = this.options.previewNodeStyle?.backgroundColor || '#60a5fa';
                ctx.strokeStyle = this.options.previewNodeStyle?.borderColor || '#3b82f6';
                ctx.lineWidth = this.options.previewNodeStyle?.borderWidth || 2;

                // 绘制圆角矩形
                const width = 100;
                const height = 50;
                const x = 10;
                const y = 5;
                const radius = 8;

                ctx.beginPath();
                ctx.roundRect(x, y, width, height, radius);
                ctx.fill();
                ctx.stroke();

                // 绘制文字
                ctx.fillStyle = '#ffffff';
                ctx.font = '14px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.currentNodeOptions?.label || 'Node', x + width / 2, y + height / 2);

                e.dataTransfer.setDragImage(canvas, width / 2, height / 2);
            }
        } else {
            // 使用 DOM 元素作为拖拽预览
            this.createDragPreviewElement();
            if (this.dragPreviewElement) {
                document.body.appendChild(this.dragPreviewElement);
                e.dataTransfer.setDragImage(this.dragPreviewElement, 60, 30);
            }
        }
    }

    /**
     * 创建拖拽预览元素
     */
    private createDragPreviewElement(): void {
        const preview = document.createElement('div');
        preview.className = this.options.dragClassName || 'dnd-drag-preview';

        // 应用样式
        const defaultStyle: Partial<CSSStyleDeclaration> = {
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: '9999',
            opacity: '0.8',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        };
        Object.assign(preview.style, defaultStyle, this.options.dragStyle);
        preview.style.width = '120px';
        preview.style.height = '60px';
        preview.style.backgroundColor = this.options.previewNodeStyle?.backgroundColor || '#60a5fa';
        preview.style.border = `${this.options.previewNodeStyle?.borderWidth || 2}px solid ${this.options.previewNodeStyle?.borderColor || '#3b82f6'}`;
        preview.style.borderRadius = '8px';
        preview.style.display = 'flex';
        preview.style.alignItems = 'center';
        preview.style.justifyContent = 'center';
        preview.style.color = '#ffffff';
        preview.style.fontSize = '14px';
        preview.style.fontFamily = 'system-ui, -apple-system, sans-serif';

        // 添加标签
        preview.textContent = this.currentNodeOptions?.label || 'Node';

        this.dragPreviewElement = preview;
    }

    /**
     * 处理拖拽悬停
     */
    private handleDragOver(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();

        // 计算世界坐标
        const position = this.getWorldPosition(e);
        this.dropPosition = position;

        // 设置放置效果
        if (e.dataTransfer) {
            const canDrop = this.validateDrop(position);
            e.dataTransfer.dropEffect = canDrop ? 'copy' : 'none';
        }

        // 只有当正在拖拽时才触发事件
        if (this.isDragging) {
            // 触发拖拽移动事件
            const dndEvent = this.createDndEvent('dnd:drag', e, position);
            this.emit('dnd:drag', dndEvent);
            this.options.onDrag?.(dndEvent);
        }
    }

    /**
     * 处理拖拽进入画布
     */
    private handleDragEnter(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();

        // 触发拖拽进入事件
        const position = this.getWorldPosition(e);
        const dndEvent = this.createDndEvent('dnd:dragenter', e, position);
        this.emit('dnd:dragenter', dndEvent);
        this.options.onDragEnter?.(dndEvent);
    }

    /**
     * 处理拖拽离开画布
     */
    private handleDragLeave(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();

        // 检查是否真的离开了画布
        const canvas = this.graph.getCanvas();
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            const position = this.getWorldPosition(e);
            const dndEvent = this.createDndEvent('dnd:dragleave', e, position);
            this.emit('dnd:dragleave', dndEvent);
            this.options.onDragLeave?.(dndEvent);
        }
    }

    /**
     * 处理放置
     */
    private handleDrop(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();

        // 计算放置位置（如果 dropPosition 为 null）
        let position = this.dropPosition;
        if (!position) {
            position = this.getWorldPosition(e);
        }

        // 验证放置
        if (!this.validateDrop(position)) {
            this.cleanup();
            return;
        }

        // 转换节点配置
        let finalNodeOptions = this.currentNodeOptions;
        if (!finalNodeOptions) {
            // 尝试从 dataTransfer 获取节点配置
            try {
                const data = e.dataTransfer?.getData('application/json');
                if (data) {
                    finalNodeOptions = JSON.parse(data) as NodeOptions;
                }
            } catch {
                // 解析失败
            }
        }

        if (!finalNodeOptions) {
            this.cleanup();
            return;
        }

        // 应用转换
        if (this.options.transformNodeOptions) {
            finalNodeOptions = this.options.transformNodeOptions(position, finalNodeOptions);
        } else {
            // 默认设置节点位置为放置位置
            finalNodeOptions = {
                ...finalNodeOptions,
                x: position.x,
                y: position.y,
            };
        }

        // 触发放置事件
        const dndEvent = this.createDndEvent('dnd:drop', e, position);
        dndEvent.nodeOptions = finalNodeOptions;

        // 先触发事件，让监听器有机会阻止
        const eventPrevented = !this.emit('dnd:drop', dndEvent);
        
        // 调用 onDrop 回调（返回 false 可阻止放置）
        const onDropResult = this.options.onDrop?.(dndEvent);
        
        // 如果 onDrop 返回 false 或事件被阻止，则不创建节点
        if (onDropResult === false || eventPrevented) {
            this.cleanup();
            return;
        }

        // 创建节点
        this.graph.addNode(finalNodeOptions);

        // 标记已成功放置
        this.isDropped = true;

        this.cleanup();
    }

    /**
     * 处理拖拽结束
     */
    private handleDragEnd(e: DragEvent): void {
        // 如果已经放置成功，不需要再触发 dragend 事件
        if (this.isDropped) {
            this.cleanup();
            return;
        }

        if (!this.isDragging) return;

        const dndEvent = this.createDndEvent('dnd:dragend', e);
        this.emit('dnd:dragend', dndEvent);
        this.options.onDragEnd?.(dndEvent);

        this.cleanup();
    }

    /**
     * 清理状态
     */
    private cleanup(): void {
        this.isDragging = false;
        this.isDropped = false;
        this.currentNodeOptions = null;
        this.dropPosition = null;

        // 移除拖拽预览元素
        if (this.dragPreviewElement && this.dragPreviewElement.parentNode) {
            this.dragPreviewElement.parentNode.removeChild(this.dragPreviewElement);
            this.dragPreviewElement = null;
        }
    }

    /**
     * 验证放置位置
     */
    private validateDrop(position: Point): boolean {
        if (this.options.validateDrop && this.currentNodeOptions) {
            return this.options.validateDrop(position, this.currentNodeOptions);
        }
        return true;
    }

    /**
     * 获取世界坐标
     */
    private getWorldPosition(e: DragEvent): Point {
        const canvas = this.graph.getCanvas();
        const rect = canvas.getBoundingClientRect();
        const screenPoint: Point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        return this.graph.screenToWorld(screenPoint);
    }

    /**
     * 创建 Dnd 事件对象
     */
    private createDndEvent(
        type: DndEvent['type'],
        originalEvent: DragEvent,
        position?: Point
    ): DndEvent {
        return {
            type,
            originalEvent,
            target: this.graph,
            position: position || this.getWorldPosition(originalEvent),
            nodeOptions: this.currentNodeOptions || undefined,
            dragElement: this.dragPreviewElement || undefined,
        };
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
     * 触发事件
     */
    private emit(eventName: string, eventData: DndEvent): boolean {
        return this.eventManager.emit(eventName, eventData);
    }

    // ==================== 公共方法 ====================

    /**
     * 检查是否正在拖拽
     */
    isDraggingActive(): boolean {
        return this.isDragging;
    }

    /**
     * 获取当前拖拽的节点配置
     */
    getCurrentNodeOptions(): NodeOptions | null {
        return this.currentNodeOptions ? { ...this.currentNodeOptions } : null;
    }

    /**
     * 获取当前的放置位置
     */
    getDropPosition(): Point | null {
        return this.dropPosition ? { ...this.dropPosition } : null;
    }

    /**
     * 设置是否启用
     */
    setEnabled(enabled: boolean): void {
        this.options.enabled = enabled;
        if (enabled) {
            this.enable();
        } else {
            this.disable();
        }
    }

    /**
     * 是否启用
     */
    getEnabled(): boolean {
        return this.options.enabled ?? true;
    }

    /**
     * 销毁插件
     */
    destroy(): void {
        this.disable();
        this.cleanup();
        this.eventManager.clear();
    }

    // ==================== 静态工具方法 ====================

    /**
     * 为 DOM 元素启用拖拽源
     * @param element - 源 DOM 元素
     * @param getNodeOptions - 获取节点配置的函数
     * @returns 清理函数
     */
    static enableSource(
        element: HTMLElement,
        getNodeOptions: (e: DragEvent) => NodeOptions
    ): () => void {
        const handleDragStart = (e: DragEvent) => {
            // 获取 Dnd 实例并启动拖拽
            const dnd = (element as any)._dndInstance as Dnd;
            if (dnd) {
                dnd.start(getNodeOptions(e), e);
            }
        };

        element.draggable = true;
        element.addEventListener('dragstart', handleDragStart);

        // 返回清理函数
        return () => {
            element.removeEventListener('dragstart', handleDragStart);
            element.draggable = false;
        };
    }

    /**
     * 绑定元素到 Dnd 实例
     * @param element - DOM 元素
     * @param dnd - Dnd 实例
     */
    static bindElement(element: HTMLElement, dnd: Dnd): void {
        (element as any)._dndInstance = dnd;
    }

    /**
     * 解绑元素
     * @param element - DOM 元素
     */
    static unbindElement(element: HTMLElement): void {
        delete (element as any)._dndInstance;
    }
}

export default Dnd;
