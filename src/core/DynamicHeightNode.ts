import { Node, NodeOptions, NodeStyle, NodeData, type NodeEvent } from './Node';
import { Port, PortOptions, PortPosition, PortStyle } from './Port';
import { Shape, ShapeConfig } from './Shape';
import { EVENT_NAMES } from './EventManager';

/**
 * 行配置接口 - 定义每一行的连接桩配置
 */
export interface RowConfig {
  /** 行ID */
  id: string;
  /** 左侧连接桩配置 */
  leftPort?: Omit<PortOptions, 'nodeId' | 'position'>;
  /** 右侧连接桩配置 */
  rightPort?: Omit<PortOptions, 'nodeId' | 'position'>;
  /** 行标签（可选，显示在左侧） */
  label?: string;
  /** 行自定义数据 */
  data?: Record<string, any>;
}

/**
 * 动态高度节点样式扩展
 */
export interface DynamicHeightNodeStyle extends NodeStyle {
  /** 行高 */
  rowHeight: number;
  /** 行间距 */
  rowGap: number;
  /** 头部高度（标签区域） */
  headerHeight: number;
  /** 底部内边距 */
  footerPadding: number;
  /** 左侧连接桩区域宽度 */
  leftPortAreaWidth: number;
  /** 右侧连接桩区域宽度 */
  rightPortAreaWidth: number;
  /** 行标签字体大小 */
  rowLabelFontSize: number;
  /** 行标签颜色 */
  rowLabelColor: string;
}

/**
 * 动态高度节点配置选项
 */
export interface DynamicHeightNodeOptions extends Omit<NodeOptions, 'style'> {
  /** 行配置数组 */
  rows: RowConfig[];
  /** 扩展样式 */
  style?: Partial<DynamicHeightNodeStyle>;
  /** 节点标签（显示在头部） */
  label?: string;
}

/**
 * 行数据接口
 */
export interface RowData {
  id: string;
  label?: string;
  leftPortId?: string;
  rightPortId?: string;
  data?: Record<string, any>;
}

/**
 * 动态高度节点数据接口
 */
export interface DynamicHeightNodeData extends NodeData {
  rows: RowData[];
  style: DynamicHeightNodeStyle;
}

/**
 * 动态高度节点事件接口
 */
export interface DynamicHeightNodeEvent extends NodeEvent {
  /** 点击的行ID（如果点击的是行区域） */
  rowId?: string;
  /** 点击的连接桩位置（left/right） */
  portSide?: 'left' | 'right';
}

/**
 * DynamicHeightNode - 动态高度节点类
 *
 * 特性：
 * - 节点高度根据行数自动计算
 * - 每行可配置左侧和/或右侧连接桩
 * - 支持行标签显示
 * - 支持动态添加/删除行
 * - 支持自定义行高和间距
 *
 * 使用示例：
 * ```typescript
 * const node = new DynamicHeightNode({
 *     id: 'dynamic-node-1',
 *     x: 100,
 *     y: 100,
 *     label: '处理节点',
 *     rows: [
 *         { id: 'row-1', label: '输入', leftPort: { id: 'in-1' }, rightPort: { id: 'out-1' } },
 *         { id: 'row-2', label: '处理', rightPort: { id: 'out-2' } },
 *         { id: 'row-3', label: '输出', leftPort: { id: 'in-2' }, rightPort: { id: 'out-3' } },
 *     ],
 *     style: { width: 200, rowHeight: 40 }
 * });
 * ```
 */
export class DynamicHeightNode extends Node {
  private rows: RowConfig[] = [];
  private rowDataMap: Map<string, RowData> = new Map();
  private extendedStyle: DynamicHeightNodeStyle;
  private leftPortIds: Set<string> = new Set();
  private rightPortIds: Set<string> = new Set();

  // 默认扩展样式
  private static readonly DEFAULT_EXTENDED_STYLE: DynamicHeightNodeStyle = {
    ...DynamicHeightNode.getDefaultNodeStyle(),
    rowHeight: 36,
    rowGap: 4,
    headerHeight: 32,
    footerPadding: 8,
    leftPortAreaWidth: 20,
    rightPortAreaWidth: 20,
    rowLabelFontSize: 12,
    rowLabelColor: '#374151',
  };

  /**
   * 获取默认节点样式（从 Node 类继承）
   */
  private static getDefaultNodeStyle(): NodeStyle {
    return {
      width: 180,
      height: 60, // 将被动态计算覆盖
      backgroundColor: '#ffffff',
      borderColor: '#d1d5db',
      borderWidth: 1,
      borderRadius: 6,
      textColor: '#1f2937',
      fontSize: 14,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowBlur: 2,
      shadowOffsetX: 0,
      shadowOffsetY: 1,
      selectedBorderColor: '#3b82f6',
      selectedBorderWidth: 2,
      hoverBackgroundColor: '#f9fafb',
      shape: { type: Shape.Rect, borderRadius: 6 },
    };
  }

  constructor(options: DynamicHeightNodeOptions) {
    // 先计算高度，再调用父类构造函数
    const extendedStyle = {
      ...DynamicHeightNode.DEFAULT_EXTENDED_STYLE,
      ...options.style,
    };

    // 计算动态高度
    const dynamicHeight = DynamicHeightNode.calculateHeight(
      options.rows?.length || 0,
      extendedStyle
    );

    // 合并样式，使用计算出的高度
    const mergedStyle: Partial<NodeStyle> = {
      ...options.style,
      height: dynamicHeight,
    };

    super({
      ...options,
      style: mergedStyle,
    });

    this.extendedStyle = extendedStyle;
    this.rows = [...(options.rows || [])];

    // 初始化行和连接桩
    this.initializeRows();
  }

  /**
   * 计算节点高度
   */
  private static calculateHeight(
    rowCount: number,
    style: DynamicHeightNodeStyle
  ): number {
    if (rowCount === 0) {
      return style.headerHeight + style.footerPadding * 2;
    }
    const rowsTotalHeight =
      rowCount * style.rowHeight + (rowCount - 1) * style.rowGap;
    return style.headerHeight + rowsTotalHeight + style.footerPadding;
  }

  /**
   * 初始化所有行和连接桩
   */
  private initializeRows(): void {
    this.rows.forEach((row, index) => {
      this.createRow(row, index);
    });
  }

  /**
   * 创建单行及其连接桩
   */
  private createRow(config: RowConfig, index: number): void {
    const rowData: RowData = {
      id: config.id,
      label: config.label,
      data: config.data ? { ...config.data } : {},
    };

    // 计算行的Y位置（相对于节点中心）
    const rowY = this.calculateRowY(index);

    // 创建左侧连接桩
    if (config.leftPort) {
      const portId = config.leftPort.id || `${this.id}-row-${config.id}-left`;
      const port = this.addPort({
        ...config.leftPort,
        id: portId,
        position: {
          x: -this.extendedStyle.width / 2 + this.extendedStyle.leftPortAreaWidth / 2,
          y: rowY,
        },
        visible: true,
      });
      rowData.leftPortId = portId;
      this.leftPortIds.add(portId);
    }

    // 创建右侧连接桩
    if (config.rightPort) {
      const portId = config.rightPort.id || `${this.id}-row-${config.id}-right`;
      const port = this.addPort({
        ...config.rightPort,
        id: portId,
        position: {
          x: this.extendedStyle.width / 2 - this.extendedStyle.rightPortAreaWidth / 2,
          y: rowY,
        },
        visible: true,
      });
      rowData.rightPortId = portId;
      this.rightPortIds.add(portId);
    }

    this.rowDataMap.set(config.id, rowData);
  }

  /**
   * 计算行的Y坐标（相对于节点中心）
   * 连接桩在行的垂直居中位置
   */
  private calculateRowY(index: number): number {
    const nodeHeight = this.getStyle().height;
    const headerHeight = this.extendedStyle.headerHeight;
    const rowHeight = this.extendedStyle.rowHeight;
    const rowGap = this.extendedStyle.rowGap;
    
    // 内容区域起始位置（相对于节点中心）
    const contentStartY = -nodeHeight / 2 + headerHeight;
    // 行的顶部位置
    const rowTop = contentStartY + index * (rowHeight + rowGap);
    // 行的中心位置（连接桩应该在这里，与绘制逻辑一致）
    return rowTop + rowHeight / 2;
  }

  /**
   * 获取扩展样式
   */
  getExtendedStyle(): DynamicHeightNodeStyle {
    return { ...this.extendedStyle };
  }

  /**
   * 更新扩展样式
   */
  updateExtendedStyle(style: Partial<DynamicHeightNodeStyle>): void {
    this.extendedStyle = { ...this.extendedStyle, ...style };
    // 重新计算高度
    const newHeight = DynamicHeightNode.calculateHeight(
      this.rows.length,
      this.extendedStyle
    );
    this.updateStyle({ height: newHeight });
    // 重新布局所有连接桩
    this.relayoutAllRows();
  }

  /**
   * 重新布局所有行
   */
  private relayoutAllRows(): void {
    this.rows.forEach((row, index) => {
      const rowData = this.rowDataMap.get(row.id);
      if (!rowData) return;

      const rowY = this.calculateRowY(index);

      // 更新左侧连接桩位置
      if (rowData.leftPortId) {
        const port = this.getPort(rowData.leftPortId);
        if (port) {
          port.setPosition({
            x: -this.extendedStyle.width / 2 + this.extendedStyle.leftPortAreaWidth / 2,
            y: rowY,
          });
        }
      }

      // 更新右侧连接桩位置
      if (rowData.rightPortId) {
        const port = this.getPort(rowData.rightPortId);
        if (port) {
          port.setPosition({
            x: this.extendedStyle.width / 2 - this.extendedStyle.rightPortAreaWidth / 2,
            y: rowY,
          });
        }
      }
    });
  }

  /**
   * 获取所有行配置
   */
  getRows(): RowConfig[] {
    return [...this.rows];
  }

  /**
   * 获取行数据
   */
  getRowData(rowId: string): RowData | undefined {
    const data = this.rowDataMap.get(rowId);
    return data ? { ...data } : undefined;
  }

  /**
   * 添加新行
   * @param config 行配置
   * @param index 插入位置（默认添加到末尾）
   */
  addRow(config: RowConfig, index?: number): void {
    const insertIndex = index !== undefined ? index : this.rows.length;
    this.rows.splice(insertIndex, 0, config);

    // 更新高度
    const newHeight = DynamicHeightNode.calculateHeight(
      this.rows.length,
      this.extendedStyle
    );
    this.updateStyle({ height: newHeight });

    // 重新创建所有行（因为位置都变了）
    this.clearAllRowPorts();
    this.rowDataMap.clear();
    this.initializeRows();
  }

  /**
   * 移除行
   * @param rowId 行ID
   */
  removeRow(rowId: string): boolean {
    const index = this.rows.findIndex((r) => r.id === rowId);
    if (index === -1) return false;

    this.rows.splice(index, 1);

    // 更新高度
    const newHeight = DynamicHeightNode.calculateHeight(
      this.rows.length,
      this.extendedStyle
    );
    this.updateStyle({ height: newHeight });

    // 重新创建所有行
    this.clearAllRowPorts();
    this.rowDataMap.clear();
    this.initializeRows();

    return true;
  }

  /**
   * 更新行
   * @param rowId 行ID
   * @param updates 更新的配置
   */
  updateRow(rowId: string, updates: Partial<RowConfig>): boolean {
    const index = this.rows.findIndex((r) => r.id === rowId);
    if (index === -1) return false;

    const oldConfig = this.rows[index];
    const newConfig = { ...oldConfig, ...updates, id: rowId };
    this.rows[index] = newConfig;

    // 如果连接桩配置有变化，需要重新创建
    const needsRecreate =
      updates.leftPort !== undefined || updates.rightPort !== undefined;

    if (needsRecreate) {
      this.clearAllRowPorts();
      this.rowDataMap.clear();
      this.initializeRows();
    } else {
      // 只更新数据
      const rowData = this.rowDataMap.get(rowId);
      if (rowData) {
        if (updates.label !== undefined) rowData.label = updates.label;
        if (updates.data !== undefined) rowData.data = { ...updates.data };
        this.rowDataMap.set(rowId, rowData);
      }
    }

    return true;
  }

  /**
   * 获取行数
   */
  getRowCount(): number {
    return this.rows.length;
  }

  /**
   * 获取指定行的连接桩ID
   * @param rowId 行ID
   * @param side 'left' | 'right'
   */
  getRowPortId(rowId: string, side: 'left' | 'right'): string | undefined {
    const rowData = this.rowDataMap.get(rowId);
    if (!rowData) return undefined;
    return side === 'left' ? rowData.leftPortId : rowData.rightPortId;
  }

  /**
   * 获取指定行的连接桩
   * @param rowId 行ID
   * @param side 'left' | 'right'
   */
  getRowPort(rowId: string, side: 'left' | 'right'): Port | undefined {
    const portId = this.getRowPortId(rowId, side);
    if (!portId) return undefined;
    return this.getPort(portId);
  }

  /**
   * 检查连接桩是否在左侧
   */
  isLeftPort(portId: string): boolean {
    return this.leftPortIds.has(portId);
  }

  /**
   * 检查连接桩是否在右侧
   */
  isRightPort(portId: string): boolean {
    return this.rightPortIds.has(portId);
  }

  /**
   * 清空所有行的连接桩
   */
  private clearAllRowPorts(): void {
    this.leftPortIds.forEach((id) => this.removePort(id));
    this.rightPortIds.forEach((id) => this.removePort(id));
    this.leftPortIds.clear();
    this.rightPortIds.clear();
  }

  /**
   * 绘制节点（重写父类方法）
   */
  draw(ctx: CanvasRenderingContext2D): void {
    const style = this.getStyle();
    const pos = this.getPosition();

    ctx.save();

    // 绘制阴影
    if (style.shadowBlur > 0) {
      ctx.shadowColor = style.shadowColor;
      ctx.shadowBlur = style.shadowBlur;
      ctx.shadowOffsetX = style.shadowOffsetX;
      ctx.shadowOffsetY = style.shadowOffsetY;
    }

    // 绘制节点背景
    this.drawBackground(ctx, pos.x, pos.y, style.width, style.height);

    // 绘制头部
    this.drawHeader(ctx, pos.x, pos.y, style.width);

    // 绘制分隔线
    this.drawSeparator(ctx, pos.x, pos.y, style.width);

    // 绘制行
    this.drawRows(ctx, pos.x, pos.y, style.width);

    ctx.restore();

    // 绘制所有连接桩
    this.drawAllPorts(ctx);
  }

  /**
   * 绘制节点背景
   */
  private drawBackground(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const style = this.getStyle();

    ctx.beginPath();
    const radius = style.borderRadius;
    const left = x - width / 2;
    const top = y - height / 2;

    // 圆角矩形路径
    ctx.moveTo(left + radius, top);
    ctx.lineTo(left + width - radius, top);
    ctx.quadraticCurveTo(left + width, top, left + width, top + radius);
    ctx.lineTo(left + width, top + height - radius);
    ctx.quadraticCurveTo(left + width, top + height, left + width - radius, top + height);
    ctx.lineTo(left + radius, top + height);
    ctx.quadraticCurveTo(left, top + height, left, top + height - radius);
    ctx.lineTo(left, top + radius);
    ctx.quadraticCurveTo(left, top, left + radius, top);
    ctx.closePath();

    // 填充
    ctx.fillStyle = this.getHovered()
      ? style.hoverBackgroundColor
      : style.backgroundColor;
    ctx.fill();

    // 边框
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = this.getSelected() ? style.selectedBorderWidth : style.borderWidth;
    ctx.strokeStyle = this.getSelected() ? style.selectedBorderColor : style.borderColor;
    ctx.stroke();
  }

  /**
   * 绘制头部
   */
  private drawHeader(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number
  ): void {
    const style = this.getStyle();
    const headerHeight = this.extendedStyle.headerHeight;
    const top = y - this.getStyle().height / 2;

    // 头部背景（略深的颜色）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.beginPath();
    ctx.rect(x - width / 2 + 1, top + 1, width - 2, headerHeight - 1);
    ctx.fill();

    // 绘制标签
    if (this.getLabel()) {
      ctx.fillStyle = style.textColor;
      ctx.font = `${style.fontSize}px ${style.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.getLabel(), x, top + headerHeight / 2);
    }
  }

  /**
   * 绘制分隔线
   */
  private drawSeparator(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number
  ): void {
    const top = y - this.getStyle().height / 2;
    const headerBottom = top + this.extendedStyle.headerHeight;

    ctx.beginPath();
    ctx.moveTo(x - width / 2 + 8, headerBottom);
    ctx.lineTo(x + width / 2 - 8, headerBottom);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /**
   * 绘制所有行
   */
  private drawRows(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number
  ): void {
    const top = y - this.getStyle().height / 2;
    const contentTop = top + this.extendedStyle.headerHeight;

    this.rows.forEach((row, index) => {
      const rowY = contentTop + index * (this.extendedStyle.rowHeight + this.extendedStyle.rowGap);
      this.drawRow(ctx, row, x, rowY, width, index);
    });
  }

  /**
   * 绘制单行
   */
  private drawRow(
    ctx: CanvasRenderingContext2D,
    row: RowConfig,
    x: number,
    rowY: number,
    width: number,
    index: number
  ): void {
    const rowHeight = this.extendedStyle.rowHeight;
    const leftPortWidth = this.extendedStyle.leftPortAreaWidth;
    const rightPortWidth = this.extendedStyle.rightPortAreaWidth;
    const contentWidth = width - leftPortWidth - rightPortWidth;

    // 交替行背景
    if (index % 2 === 1) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(x - width / 2 + 1, rowY, width - 2, rowHeight);
    }

    // 绘制行标签
    if (row.label) {
      const labelX = x - width / 2 + leftPortWidth + contentWidth / 2;
      const labelY = rowY + rowHeight / 2;

      ctx.fillStyle = this.extendedStyle.rowLabelColor;
      ctx.font = `${this.extendedStyle.rowLabelFontSize}px ${this.getStyle().fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 截断文字
      const maxWidth = contentWidth - 16;
      let displayLabel = row.label;
      const metrics = ctx.measureText(displayLabel);
      if (metrics.width > maxWidth) {
        let truncated = displayLabel;
        while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1);
        }
        displayLabel = truncated + '...';
      }

      ctx.fillText(displayLabel, labelX, labelY);
    }
  }

  /**
   * 根据点获取行索引
   * @param point 坐标点
   * @returns 行索引或 -1
   */
  getRowIndexAtPoint(point: { x: number; y: number }): number {
    const pos = this.getPosition();
    const style = this.getStyle();
    const top = pos.y - style.height / 2 + this.extendedStyle.headerHeight;
    const contentHeight =
      this.rows.length * this.extendedStyle.rowHeight +
      (this.rows.length - 1) * this.extendedStyle.rowGap;

    // 检查是否在内容区域
    if (
      point.y < top ||
      point.y > top + contentHeight ||
      point.x < pos.x - style.width / 2 ||
      point.x > pos.x + style.width / 2
    ) {
      return -1;
    }

    const relativeY = point.y - top;
    const rowIndex = Math.floor(
      relativeY / (this.extendedStyle.rowHeight + this.extendedStyle.rowGap)
    );

    return rowIndex >= 0 && rowIndex < this.rows.length ? rowIndex : -1;
  }

  /**
   * 根据点获取行ID
   */
  getRowIdAtPoint(point: { x: number; y: number }): string | undefined {
    const index = this.getRowIndexAtPoint(point);
    if (index === -1) return undefined;
    return this.rows[index]?.id;
  }

  /**
   * 序列化为 JSON
   */
  toJSON(): DynamicHeightNodeData {
    const baseData = super.toJSON();
    const rows: RowData[] = this.rows.map((row) => {
      const rowData = this.rowDataMap.get(row.id);
      return {
        id: row.id,
        label: row.label,
        leftPortId: rowData?.leftPortId,
        rightPortId: rowData?.rightPortId,
        data: rowData?.data ? { ...rowData.data } : undefined,
      };
    });

    return {
      ...baseData,
      rows,
      style: { ...this.extendedStyle },
    };
  }

  /**
   * 从 JSON 创建节点
   */
  static fromJSON(data: DynamicHeightNodeData): DynamicHeightNode {
    const rows: RowConfig[] = data.rows.map((row) => ({
      id: row.id,
      label: row.label,
      leftPort: row.leftPortId ? { id: row.leftPortId } : undefined,
      rightPort: row.rightPortId ? { id: row.rightPortId } : undefined,
      data: row.data,
    }));

    return new DynamicHeightNode({
      id: data.id,
      x: data.position.x,
      y: data.position.y,
      label: data.label,
      rows,
      style: data.style,
      data: data.data,
    });
  }

  /**
   * 克隆节点
   */
  clone(newId?: string): DynamicHeightNode {
    return new DynamicHeightNode({
      id: newId || `${this.id}_clone`,
      x: this.getPosition().x + 20,
      y: this.getPosition().y + 20,
      label: this.getLabel(),
      rows: this.rows.map((row) => ({ ...row })),
      style: { ...this.extendedStyle },
      data: this.getData(),
    });
  }
}

export default DynamicHeightNode;
