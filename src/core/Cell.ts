/**
 * 基础样式接口 - Cell 的通用样式属性
 */
export interface BaseStyle {
    /** 选中状态颜色 */
    selectedColor: string;
    /** 悬停状态颜色 */
    hoverColor: string;
}

/**
 * Cell 配置选项基础接口
 */
export interface CellOptions {
    id: string;
    label?: string;
    data?: Record<string, any>;
}

/**
 * Cell 数据接口
 */
export interface CellData {
    id: string;
    label?: string;
    data?: Record<string, any>;
}

/**
 * Cell - 基础单元类
 *
 * 作为 Node 和 Edge 的基类，提供共同属性和方法：
 * - ID、标签、数据
 * - 选中、悬停状态
 * - 序列化和克隆
 */
export abstract class Cell {
    protected id: string;
    protected label: string;
    protected data: Record<string, any>;
    protected isSelected: boolean = false;
    protected isHovered: boolean = false;

    constructor(options: CellOptions) {
        this.id = options.id;
        this.label = options.label || '';
        this.data = options.data || {};
    }

    /**
     * 获取单元 ID
     */
    getId(): string {
        return this.id;
    }

    /**
     * 获取标签
     */
    getLabel(): string {
        return this.label;
    }

    /**
     * 设置标签
     */
    setLabel(label: string): void {
        this.label = label;
    }

    /**
     * 获取数据
     */
    getData(): Record<string, any> {
        return { ...this.data };
    }

    /**
     * 设置数据
     */
    setData(data: Record<string, any>): void {
        this.data = data;
    }

    /**
     * 设置选中状态
     */
    setSelected(selected: boolean): void {
        this.isSelected = selected;
    }

    /**
     * 是否选中
     */
    getSelected(): boolean {
        return this.isSelected;
    }

    /**
     * 设置悬停状态
     */
    setHovered(hovered: boolean): void {
        this.isHovered = hovered;
    }

    /**
     * 是否悬停
     */
    getHovered(): boolean {
        return this.isHovered;
    }

    /**
     * 切换选中状态
     */
    toggleSelected(): void {
        this.isSelected = !this.isSelected;
    }

    /**
     * 抽象方法：序列化为 JSON
     * 子类必须实现
     */
    abstract toJSON(): CellData;

    /**
     * 抽象方法：克隆单元
     * 子类必须实现
     */
    abstract clone(newId?: string): Cell;

    /**
     * 抽象方法：绘制单元
     * 子类必须实现
     */
    abstract draw(ctx: CanvasRenderingContext2D, ...args: any[]): void;

    /**
     * 获取 CSS 类名
     */
    getClassName(): string {
        const classes = ['cell'];
        if (this.isSelected) classes.push('selected');
        if (this.isHovered) classes.push('hovered');
        return classes.join(' ');
    }

    /**
     * 基础 CSS 样式字符串
     */
    static readonly BASE_CSS_STYLES = `
        .cell {
            transition: all 0.2s ease;
        }
        
        .cell.selected {
            filter: brightness(1.1);
        }
        
        .cell.hovered {
            filter: brightness(1.05);
        }
    `;
}

export default Cell;
