import { Graph, Point } from '../core/Graph';
import { Node } from '../core/Node';

/**
 * Selection 事件对象
 */
export interface SelectionEvent {
    /** 事件类型 */
    type: 'selection:start' | 'selection:move' | 'selection:end';
    /** 选中的节点 */
    selectedNodes: Node[];
    /** 选择框的边界 */
    bounds?: { x: number; y: number; width: number; height: number };
    /** 鼠标位置（世界坐标） */
    position?: Point;
}

/**
 * Selection 配置选项
 */
export interface SelectionOptions {
    /** 是否启用框选 */
    enabled?: boolean;
    /** 选择框样式 */
    selectionBoxStyle?: {
        strokeColor?: string;
        strokeWidth?: number;
        fillColor?: string;
    };
    /** 是否允许多选 */
    multiple?: boolean;
    /** 框选开始回调 */
    onSelectionStart?: (e: SelectionEvent) => void;
    /** 框选中回调 */
    onSelectionMove?: (e: SelectionEvent) => void;
    /** 框选结束回调 */
    onSelectionEnd?: (e: SelectionEvent) => void;
}

/**
 * 插件接口
 */
export interface Plugin {
    /** 插件名称 */
    name: string;
    /** 安装插件 */
    install(graph: Graph): void;
    /** 卸载插件 */
    uninstall(): void;
}

/**
 * Selection - 框选插件
 *
 * 功能特性：
 * - 按住 Alt键 + 鼠标左键在画布空白处拖动进行框选
 * - 显示蓝色虚线选择框
 * - 支持与选择框相交或包含在内的节点被选中
 * - 支持多选模式
 *
 * 使用示例：
 * ```typescript
 * const selection = new Selection({
 *     enabled: true,
 *     multiple: true,
 *     onSelectionEnd: (e) => console.log('选中节点:', e.selectedNodes),
 * });
 *
 * // 通过 graph.use 注册插件
 * graph.use(selection);
 * ```
 *
 * 操作说明：
 * - 按住 Alt + 鼠标左键拖动：开始框选
 * - 按住 Ctrl/Cmd + Alt + 鼠标左键拖动：追加选择
 */
export class Selection implements Plugin {
    readonly name = 'selection';

    private graph: Graph | null = null;
    private options: SelectionOptions;
    private isSelecting: boolean = false;
    private selectionStartPoint: Point | null = null;
    private selectionCurrentPoint: Point | null = null;
    private selectionBoxElement: HTMLDivElement | null = null;
    private selectedNodes: Set<string> = new Set();

    // 选择框拖拽状态
    private isDraggingSelectionBox: boolean = false;
    private dragStartPoint: Point | null = null;
    private dragStartNodePositions: Map<string, Point> = new Map();

    // 默认配置
    private static readonly DEFAULT_OPTIONS: SelectionOptions = {
        enabled: true,
        multiple: true,
        selectionBoxStyle: {
            strokeColor: '#3b82f6',
            strokeWidth: 2,
            fillColor: 'rgba(59, 130, 246, 0.1)',
        },
    };

    constructor(options: SelectionOptions = {}) {
        this.options = {
            ...Selection.DEFAULT_OPTIONS,
            ...options,
            selectionBoxStyle: {
                ...Selection.DEFAULT_OPTIONS.selectionBoxStyle,
                ...options.selectionBoxStyle,
            },
        };
    }

    /**
     * 安装插件（由 Graph.use 调用）
     */
    install(graph: Graph): void {
        this.graph = graph;
        if (this.options.enabled) {
            this.enable();
        }
    }

    /**
     * 卸载插件
     */
    uninstall(): void {
        this.disable();
        this.graph = null;
    }

    /**
     * 启用框选
     */
    enable(): void {
        if (!this.graph) return;
        this.graph.on('blank:mousedown', this.handleBlankMouseDown);
        this.graph.on('blank:mousemove', this.handleBlankMouseMove);
        this.graph.on('blank:mouseup', this.handleBlankMouseUp);
        // 全局 mousemove 和 mouseup 在框选开始后才绑定到 document
    }

    /**
     * 禁用框选
     */
    disable(): void {
        if (!this.graph) return;
        this.graph.off('blank:mousedown', this.handleBlankMouseDown);
        this.graph.off('blank:mousemove', this.handleBlankMouseMove);
        this.graph.off('blank:mouseup', this.handleBlankMouseUp);
        // 移除全局事件监听
        this.removeGlobalListeners();
    }

    /**
     * 添加全局事件监听
     */
    private addGlobalListeners(): void {
        document.addEventListener('mousemove', this.handleGlobalMouseMove);
        document.addEventListener('mouseup', this.handleGlobalMouseUp);
    }

    /**
     * 移除全局事件监听
     */
    private removeGlobalListeners(): void {
        document.removeEventListener('mousemove', this.handleGlobalMouseMove);
        document.removeEventListener('mouseup', this.handleGlobalMouseUp);
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
     * 获取当前选中的节点
     */
    getSelectedNodes(): Node[] {
        if (!this.graph) return [];
        return this.graph.getAllNodes().filter(node => this.selectedNodes.has(node.getId()));
    }

    /**
     * 清除选择
     */
    clearSelection(): void {
        this.selectedNodes.clear();
        if (this.graph) {
            // 取消所有节点的选中状态
            this.graph.getAllNodes().forEach(node => {
                node.setSelected(false);
            });
            // 清除 Graph 的选中状态引用
            (this.graph as any).selectedNode = null;
            this.graph.scheduleRender?.();
        }
        // 清除选择框
        this.removeSelectionBox();
    }

    /**
     * 处理画布鼠标按下事件
     */
    private handleBlankMouseDown = (e: { x: number; y: number; originalEvent: MouseEvent }): void => {
        // 如果不是左键点击，不开始框选
        if (e.originalEvent.button !== 0) return;

        // 必须按住 Alt键才能开始框选
        if (!e.originalEvent.altKey) return;

        // 阻止事件传播，防止触发其他默认行为
        e.originalEvent.stopPropagation();

        this.isSelecting = true;
        this.selectionStartPoint = { x: e.x, y: e.y };
        this.selectionCurrentPoint = { x: e.x, y: e.y };

        // 如果不是多选模式，清除之前的选择
        if (!this.options.multiple || !e.originalEvent.ctrlKey && !e.originalEvent.metaKey) {
            this.clearSelection();
        }

        // 创建选择框元素
        this.createSelectionBox();

        // 绑定全局事件监听（确保鼠标移出画布也能正常框选）
        this.addGlobalListeners();

        // 触发选择开始事件
        this.options.onSelectionStart?.({
            type: 'selection:start',
            selectedNodes: this.getSelectedNodes(),
            position: this.selectionStartPoint,
        });
    };

    /**
     * 处理画布鼠标移动事件（Graph事件）
     */
    private handleBlankMouseMove = (e: { x: number; y: number; originalEvent: MouseEvent }): void => {
        // 只有正在进行框选时才处理
        if (!this.isSelecting) return;

        // 阻止事件传播
        e.originalEvent.stopPropagation();

        this.updateSelection(e.x, e.y);
    };

    /**
     * 处理画布鼠标抬起事件（Graph事件）
     */
    private handleBlankMouseUp = (e: { x: number; y: number; originalEvent: MouseEvent }): void => {
        // 只有正在进行框选时才处理
        if (!this.isSelecting) return;

        // 阻止事件传播，防止 Graph 的默认处理取消选中
        e.originalEvent.stopPropagation();

        // 结束选择
        this.endSelection();
    };

    /**
     * 全局鼠标移动处理
     */
    private handleGlobalMouseMove = (e: globalThis.MouseEvent): void => {
        if (!this.isSelecting || !this.graph) return;

        // 将屏幕坐标转换为世界坐标
        const rect = this.graph.getCanvas().getBoundingClientRect();
        const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const worldPoint = this.graph.screenToWorld(screenPoint);

        this.updateSelection(worldPoint.x, worldPoint.y);
    };

    /**
     * 全局鼠标抬起处理
     */
    private handleGlobalMouseUp = (): void => {
        // 结束选择
        this.endSelection();
        // 移除全局事件监听
        this.removeGlobalListeners();
    };

    /**
     * 更新选择状态
     */
    private updateSelection(x: number, y: number): void {
        if (!this.isSelecting || !this.selectionStartPoint) return;

        this.selectionCurrentPoint = { x, y };

        // 更新选择框显示
        this.updateSelectionBox();

        // 计算选择框内的节点
        this.updateSelectedNodes();

        // 触发选择移动事件
        this.options.onSelectionMove?.({
            type: 'selection:move',
            selectedNodes: this.getSelectedNodes(),
            bounds: this.getSelectionBounds(),
            position: this.selectionCurrentPoint,
        });
    }

    /**
     * 结束选择
     */
    private endSelection(): void {
        if (!this.isSelecting) return;

        // 确保最后一次更新选中节点（使用最终的坐标）
        this.updateSelectedNodes();

        this.isSelecting = false;

        // 更新选择框为选中节点的包围盒
        this.updateSelectionBoxToSelectedNodes();

        // 触发选择结束事件
        this.options.onSelectionEnd?.({
            type: 'selection:end',
            selectedNodes: this.getSelectedNodes(),
            bounds: this.getSelectionBounds(),
            position: this.selectionCurrentPoint || this.selectionStartPoint!,
        });

        this.selectionStartPoint = null;
        this.selectionCurrentPoint = null;
    }

    /**
     * 创建选择框元素
     */
    private createSelectionBox(): void {
        if (!this.graph) return;

        this.selectionBoxElement = document.createElement('div');
        this.selectionBoxElement.style.position = 'absolute';
        this.selectionBoxElement.style.pointerEvents = 'auto';
        this.selectionBoxElement.style.zIndex = '1000';
        this.selectionBoxElement.style.borderStyle = 'dashed';
        this.selectionBoxElement.style.cursor = 'move';

        const style = this.options.selectionBoxStyle;
        if (style) {
            this.selectionBoxElement.style.borderColor = style.strokeColor || '#3b82f6';
            this.selectionBoxElement.style.borderWidth = `${style.strokeWidth || 2}px`;
            this.selectionBoxElement.style.backgroundColor = style.fillColor || 'rgba(59, 130, 246, 0.1)';
        }

        // 创建删除按钮
        const deleteButton = document.createElement('div');
        deleteButton.innerHTML = '×';
        deleteButton.style.cssText = `
            position: absolute;
            top: -12px;
            right: -12px;
            width: 20px;
            height: 20px;
            background: #ef4444;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            pointer-events: auto;
            user-select: none;
            line-height: 1;
            padding-bottom: 2px;
        `;
        deleteButton.addEventListener('click', this.handleDeleteButtonClick);
        deleteButton.addEventListener('mousedown', (e) => e.stopPropagation());
        this.selectionBoxElement.appendChild(deleteButton);

        const canvas = this.graph.getCanvas();
        const container = canvas?.parentElement;
        if (container) {
            container.appendChild(this.selectionBoxElement);
        }

        // 绑定选择框的鼠标事件
        this.selectionBoxElement.addEventListener('mousedown', this.handleSelectionBoxMouseDown);

        this.updateSelectionBox();
    }

    /**
     * 处理删除按钮点击事件
     */
    private handleDeleteButtonClick = (e: MouseEvent): void => {
        e.stopPropagation();
        e.preventDefault();

        // 只清除选择框和选择状态，不删除节点
        this.clearSelection();
    };

    /**
     * 处理选择框鼠标按下事件
     */
    private handleSelectionBoxMouseDown = (e: MouseEvent): void => {
        if (!this.graph || e.button !== 0) return;

        e.stopPropagation();
        e.preventDefault();

        this.isDraggingSelectionBox = true;

        // 将屏幕坐标转换为世界坐标
        const rect = this.graph.getCanvas().getBoundingClientRect();
        const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        this.dragStartPoint = this.graph.screenToWorld(screenPoint);

        // 记录所有选中节点的初始位置
        this.dragStartNodePositions.clear();
        const selectedNodes = this.getSelectedNodes();
        selectedNodes.forEach(node => {
            const pos = node.getPosition();
            this.dragStartNodePositions.set(node.getId(), { ...pos });
        });

        // 绑定拖拽事件
        document.addEventListener('mousemove', this.handleSelectionBoxDragMove);
        document.addEventListener('mouseup', this.handleSelectionBoxDragEnd);
    };

    /**
     * 处理选择框拖拽移动
     */
    private handleSelectionBoxDragMove = (e: MouseEvent): void => {
        if (!this.isDraggingSelectionBox || !this.graph || !this.dragStartPoint) return;

        // 将屏幕坐标转换为世界坐标
        const rect = this.graph.getCanvas().getBoundingClientRect();
        const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const currentPoint = this.graph.screenToWorld(screenPoint);

        // 计算偏移量
        const deltaX = currentPoint.x - this.dragStartPoint.x;
        const deltaY = currentPoint.y - this.dragStartPoint.y;

        // 移动所有选中的节点
        const selectedNodes = this.getSelectedNodes();
        selectedNodes.forEach(node => {
            const startPos = this.dragStartNodePositions.get(node.getId());
            if (startPos) {
                node.setPosition(startPos.x + deltaX, startPos.y + deltaY);
            }
        });

        // 更新选择框位置
        this.updateSelectionBoxToSelectedNodes();

        // 触发重新渲染
        this.graph.scheduleRender?.();
    };

    /**
     * 处理选择框拖拽结束
     */
    private handleSelectionBoxDragEnd = (): void => {
        this.isDraggingSelectionBox = false;
        this.dragStartPoint = null;
        this.dragStartNodePositions.clear();

        // 移除拖拽事件监听
        document.removeEventListener('mousemove', this.handleSelectionBoxDragMove);
        document.removeEventListener('mouseup', this.handleSelectionBoxDragEnd);
    };

    /**
     * 更新选择框位置和大小
     */
    private updateSelectionBox(): void {
        if (!this.selectionBoxElement || !this.selectionStartPoint || !this.selectionCurrentPoint || !this.graph) return;

        // 将世界坐标转换为屏幕坐标
        const startScreen = this.graph.worldToScreen(this.selectionStartPoint);
        const currentScreen = this.graph.worldToScreen(this.selectionCurrentPoint);

        const minX = Math.min(startScreen.x, currentScreen.x);
        const minY = Math.min(startScreen.y, currentScreen.y);
        const maxX = Math.max(startScreen.x, currentScreen.x);
        const maxY = Math.max(startScreen.y, currentScreen.y);

        this.selectionBoxElement.style.left = `${minX}px`;
        this.selectionBoxElement.style.top = `${minY}px`;
        this.selectionBoxElement.style.width = `${maxX - minX}px`;
        this.selectionBoxElement.style.height = `${maxY - minY}px`;
    }

    /**
     * 移除选择框元素
     */
    private removeSelectionBox(): void {
        if (this.selectionBoxElement) {
            // 移除事件监听
            this.selectionBoxElement.removeEventListener('mousedown', this.handleSelectionBoxMouseDown);
            if (this.isDraggingSelectionBox) {
                document.removeEventListener('mousemove', this.handleSelectionBoxDragMove);
                document.removeEventListener('mouseup', this.handleSelectionBoxDragEnd);
                this.isDraggingSelectionBox = false;
            }
            // 移除元素
            if (this.selectionBoxElement.parentNode) {
                this.selectionBoxElement.parentNode.removeChild(this.selectionBoxElement);
            }
            this.selectionBoxElement = null;
        }
    }

    /**
     * 更新选择框为选中节点的包围盒
     */
    private updateSelectionBoxToSelectedNodes(): void {
        if (!this.graph || !this.selectionBoxElement) return;

        const selectedNodes = this.getSelectedNodes();
        if (selectedNodes.length === 0) {
            // 如果没有选中节点，移除选择框
            this.removeSelectionBox();
            return;
        }

        // 计算选中节点的边界框
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        selectedNodes.forEach(node => {
            const bounds = node.getBounds();
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });

        // 添加一些内边距
        const padding = 10;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        // 将世界坐标转换为屏幕坐标
        const topLeftScreen = this.graph.worldToScreen({ x: minX, y: minY });
        const bottomRightScreen = this.graph.worldToScreen({ x: maxX, y: maxY });

        // 更新选择框位置和大小
        this.selectionBoxElement.style.left = `${topLeftScreen.x}px`;
        this.selectionBoxElement.style.top = `${topLeftScreen.y}px`;
        this.selectionBoxElement.style.width = `${bottomRightScreen.x - topLeftScreen.x}px`;
        this.selectionBoxElement.style.height = `${bottomRightScreen.y - topLeftScreen.y}px`;
    }

    /**
     * 获取选择框的边界（世界坐标）
     */
    private getSelectionBounds(): { x: number; y: number; width: number; height: number } | undefined {
        if (!this.selectionStartPoint || !this.selectionCurrentPoint) return undefined;

        const minX = Math.min(this.selectionStartPoint.x, this.selectionCurrentPoint.x);
        const minY = Math.min(this.selectionStartPoint.y, this.selectionCurrentPoint.y);
        const maxX = Math.max(this.selectionStartPoint.x, this.selectionCurrentPoint.x);
        const maxY = Math.max(this.selectionStartPoint.y, this.selectionCurrentPoint.y);

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }

    /**
     * 更新选中的节点
     */
    private updateSelectedNodes(): void {
        if (!this.graph || !this.selectionStartPoint || !this.selectionCurrentPoint) return;

        const bounds = this.getSelectionBounds();
        if (!bounds) return;

        const allNodes = this.graph.getAllNodes();

        allNodes.forEach(node => {
            const nodeBounds = node.getBounds();
            const nodeId = node.getId();

            // 检查节点是否与选择框相交或包含在内
            if (this.isRectIntersect(bounds, nodeBounds)) {
                if (!this.selectedNodes.has(nodeId)) {
                    this.selectedNodes.add(nodeId);
                    node.setSelected(true);
                }
            } else {
                // 如果不在选择框内，且不是按住 Ctrl/Cmd 键的多选模式，取消选中
                if (this.selectedNodes.has(nodeId)) {
                    this.selectedNodes.delete(nodeId);
                    node.setSelected(false);
                }
            }
        });

        // 触发重新渲染
        this.graph.scheduleRender?.();
    }

    /**
     * 检查两个矩形是否相交
     */
    private isRectIntersect(
        rect1: { x: number; y: number; width: number; height: number },
        rect2: { x: number; y: number; width: number; height: number }
    ): boolean {
        return !(
            rect1.x + rect1.width < rect2.x ||
            rect2.x + rect2.width < rect1.x ||
            rect1.y + rect1.height < rect2.y ||
            rect2.y + rect2.height < rect1.y
        );
    }
}

export default Selection;
