import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Splitter, Table, Anchor, Button } from '@zjpcy/simple-design';
import {
  CodeEditor,
  Panel,
  PanelHeader,
  PanelContent,
  PanelToolbar,
} from './components/CodeEditor';
import './styles/panel.css';

// Shape 类型表格数据
const shapeTypeColumns = [
  { title: '形状类型', dataIndex: 'name', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const shapeTypeData = [
  { name: 'Shape.Rect', description: '矩形，支持 borderRadius 配置圆角' },
  { name: 'Shape.Circle', description: '圆形，使用外接矩形定义' },
  { name: 'Shape.Ellipse', description: '椭圆形，可设置不同宽高' },
  { name: 'Shape.Polygon', description: '多边形，通过 points 数组定义顶点' },
  { name: 'Shape.Polyline', description: '折线，无填充的连线' },
  { name: 'Shape.Path', description: '路径，SVG 路径字符串定义复杂形状' },
  { name: 'Shape.Image', description: '图片，使用图片作为节点背景' },
  { name: 'Shape.HTML', description: '自定义 HTML 内容' },
];

// ShapeStyle 配置表格
const shapeStyleColumns = [
  { title: '属性名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 150 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const shapeStyleData = [
  { name: 'width', type: 'number', default: '100', description: '形状宽度' },
  { name: 'height', type: 'number', default: '60', description: '形状高度' },
  { name: 'backgroundColor', type: 'string', default: "'#fff'", description: '填充颜色' },
  { name: 'borderColor', type: 'string', default: "'#ccc'", description: '边框颜色' },
  { name: 'borderWidth', type: 'number', default: '1', description: '边框宽度' },
  { name: 'borderRadius', type: 'number', default: '0', description: '矩形圆角半径' },
  { name: 'textColor', type: 'string', default: "'#333'", description: '文本颜色' },
  { name: 'fontSize', type: 'number', default: '14', description: '字体大小' },
  { name: 'opacity', type: 'number', default: '1', description: '不透明度 (0-1)' },
];

// 示例 1: 基础形状
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// ===== 第 1 行：基础几何形状 =====

// 矩形 (Rect)
graph.addNode({
  id: 'shape-rect',
  label: 'Rect',
  x: 100,
  y: 100,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 80,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
    borderRadius: 4,
  },
});

// 圆形 (Circle)
graph.addNode({
  id: 'shape-circle',
  label: 'Circle',
  x: 280,
  y: 100,
  shape: Shape.Circle,
  style: {
    width: 90,
    height: 90,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

// 椭圆 (Ellipse)
graph.addNode({
  id: 'shape-ellipse',
  label: 'Ellipse',
  x: 450,
  y: 100,
  shape: Shape.Ellipse,
  style: {
    width: 120,
    height: 70,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
  },
});

// ===== 第 2 行：多边形 =====

// 菱形 (Diamond)
graph.addNode({
  id: 'shape-diamond',
  label: 'Diamond',
  x: 100,
  y: 240,
  shape: {
    type: Shape.Polygon,
    points: [
      { x: 0, y: -40 },
      { x: 50, y: 0 },
      { x: 0, y: 40 },
      { x: -50, y: 0 },
    ],
  },
  style: {
    width: 100,
    height: 80,
    backgroundColor: '#ec4899',
    borderColor: '#db2777',
    textColor: '#ffffff',
  },
});

// 六边形 (Hexagon)
graph.addNode({
  id: 'shape-hexagon',
  label: 'Hexagon',
  x: 300,
  y: 240,
  shape: {
    type: Shape.Polygon,
    points: [
      { x: -30, y: -50 },
      { x: 30, y: -50 },
      { x: 60, y: 0 },
      { x: 30, y: 50 },
      { x: -30, y: 50 },
      { x: -60, y: 0 },
    ],
  },
  style: {
    width: 120,
    height: 100,
    backgroundColor: '#14b8a6',
    borderColor: '#0d9488',
    textColor: '#ffffff',
  },
});

// 三角形 (Triangle)
graph.addNode({
  id: 'shape-triangle',
  label: 'Triangle',
  x: 500,
  y: 240,
  shape: {
    type: Shape.Polygon,
    points: [
      { x: 0, y: -40 },
      { x: 45, y: 40 },
      { x: -45, y: 40 },
    ],
  },
  style: {
    width: 90,
    height: 90,
    backgroundColor: '#f97316',
    borderColor: '#ea580c',
    textColor: '#ffffff',
  },
});

console.log('✅ 基础形状创建完成');
console.log('   - Rect: 矩形，可设置圆角');
console.log('   - Circle: 正圆形');
console.log('   - Ellipse: 椭圆形');
console.log('   - Polygon: 多边形，通过 points 定义顶点');`;

// 示例 2: 圆角矩形变体
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// ===== 圆角矩形变体 =====

// 小圆角
graph.addNode({
  id: 'shape-radius-small',
  label: '小圆角',
  x: 100,
  y: 120,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#0ea5e9',
    borderColor: '#0284c7',
    textColor: '#ffffff',
    borderRadius: 4,
  },
});

// 中圆角
graph.addNode({
  id: 'shape-radius-medium',
  label: '中圆角',
  x: 240,
  y: 120,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#0ea5e9',
    borderColor: '#0284c7',
    textColor: '#ffffff',
    borderRadius: 12,
  },
});

// 大圆角
graph.addNode({
  id: 'shape-radius-large',
  label: '大圆角',
  x: 380,
  y: 120,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#0ea5e9',
    borderColor: '#0284c7',
    textColor: '#ffffff',
    borderRadius: 25,
  },
});

// 全圆角（胶囊形）
graph.addNode({
  id: 'shape-radius-full',
  label: '全圆角',
  x: 520,
  y: 120,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#0ea5e9',
    borderColor: '#0284c7',
    textColor: '#ffffff',
    borderRadius: 30, // 高度的一半
  },
});

// ===== 特殊形状 =====

// 星形
graph.addNode({
  id: 'shape-star',
  label: 'Star',
  x: 150,
  y: 280,
  shape: {
    type: Shape.Polygon,
    points: [
      { x: 0, y: -45 },
      { x: 12, y: -15 },
      { x: 45, y: -10 },
      { x: 20, y: 10 },
      { x: 30, y: 45 },
      { x: 0, y: 25 },
      { x: -30, y: 45 },
      { x: -20, y: 10 },
      { x: -45, y: -10 },
      { x: -12, y: -15 },
    ],
  },
  style: {
    width: 110,
    height: 110,
    backgroundColor: '#eab308',
    borderColor: '#ca8a04',
    textColor: '#ffffff',
  },
});

// 梯形
graph.addNode({
  id: 'shape-trapezoid',
  label: 'Trapezoid',
  x: 320,
  y: 280,
  shape: {
    type: Shape.Polygon,
    points: [
      { x: -30, y: -30 },
      { x: 30, y: -30 },
      { x: 50, y: 30 },
      { x: -50, y: 30 },
    ],
  },
  style: {
    width: 110,
    height: 70,
    backgroundColor: '#6366f1',
    borderColor: '#4f46e5',
    textColor: '#ffffff',
  },
});

// 平行四边形
graph.addNode({
  id: 'shape-parallelogram',
  label: 'Parallelogram',
  x: 500,
  y: 280,
  shape: {
    type: Shape.Polygon,
    points: [
      { x: -40, y: -30 },
      { x: 40, y: -30 },
      { x: 60, y: 30 },
      { x: -20, y: 30 },
    ],
  },
  style: {
    width: 130,
    height: 70,
    backgroundColor: '#f43f5e',
    borderColor: '#e11d48',
    textColor: '#ffffff',
  },
});

console.log('🎨 圆角和特殊形状创建完成');
console.log('   - 通过 borderRadius 控制矩形圆角程度');
console.log('   - borderRadius = 高度/2 时呈现胶囊形');
console.log('   - Polygon 可以创建任意多边形');`;

// 示例 3: 形状样式
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// ===== 样式展示 =====

// 实线边框
graph.addNode({
  id: 'style-solid',
  label: '实线边框',
  x: 100,
  y: 100,
  shape: Shape.Rect,
  style: {
    width: 110,
    height: 70,
    backgroundColor: '#ffffff',
    borderColor: '#3b82f6',
    borderWidth: 2,
    textColor: '#333333',
  },
});

// 无边框
graph.addNode({
  id: 'style-noborder',
  label: '无边框',
  x: 260,
  y: 100,
  shape: Shape.Rect,
  style: {
    width: 110,
    height: 70,
    backgroundColor: '#22c55e',
    borderWidth: 0,
    textColor: '#ffffff',
  },
});

// 半透明
graph.addNode({
  id: 'style-opacity',
  label: '半透明',
  x: 420,
  y: 100,
  shape: Shape.Rect,
  style: {
    width: 110,
    height: 70,
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    textColor: '#ffffff',
    opacity: 0.6,
  },
});

// 大字体
graph.addNode({
  id: 'style-font',
  label: '大字体',
  x: 580,
  y: 100,
  shape: Shape.Rect,
  style: {
    width: 110,
    height: 70,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
    fontSize: 18,
  },
});

// 渐变效果（通过颜色模拟）
graph.addNode({
  id: 'style-gradient-1',
  label: '节点 1',
  x: 100,
  y: 240,
  shape: Shape.Circle,
  style: {
    width: 90,
    height: 90,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
});

graph.addNode({
  id: 'style-gradient-2',
  label: '节点 2',
  x: 260,
  y: 240,
  shape: Shape.Circle,
  style: {
    width: 90,
    height: 90,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

// 带端口的形状
const portNode = graph.addNode({
  id: 'style-ports',
  label: '带端口',
  x: 450,
  y: 240,
  shape: Shape.Rect,
  style: {
    width: 130,
    height: 90,
    backgroundColor: '#ec4899',
    borderColor: '#db2777',
    textColor: '#ffffff',
  },
});

// 添加输入端口
portNode.addPort({ id: 'in-1', position: 'left', visible: true });
portNode.addPort({ id: 'in-2', position: 'left', visible: true });
// 添加输出端口
portNode.addPort({ id: 'out-1', position: 'right', visible: true });
portNode.addPort({ id: 'out-2', position: 'right', visible: true });

console.log('🎯 样式配置展示完成');
console.log('   - borderWidth: 边框宽度，设为 0 无边框');
console.log('   - opacity: 不透明度 (0-1)');
console.log('   - fontSize: 文本字体大小');
console.log('   - 形状支持添加端口进行连接');`;

// 示例 4: HTML 自定义形状
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// ===== HTML 自定义形状 =====
// 使用 HTML 内容作为节点，支持任意复杂的 UI

// 卡片样式节点
graph.addNode({
  id: 'html-card',
  label: '', // HTML 节点不需要 label
  x: 100,
  y: 100,
  shape: {
    type: Shape.HTML,
    html: \`
      <div>
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">
          📊 数据卡片
        </div>
        <div style="font-size: 12px; opacity: 0.9; line-height: 1.5;">
          这是一个 HTML 自定义节点<br/>
          支持任意 HTML 内容
        </div>
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.3);">
          <span style="font-size: 11px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px;">
            Status: Active
          </span>
        </div>
      </div>
    \`,
  },
  style: {
    width: 160,
    height: 120,
  },
});

// 按钮样式节点
graph.addNode({
  id: 'html-button',
  label: '',
  x: 350,
  y: 100,
  shape: {
    type: Shape.HTML,
    html: \`
      <div>
        <div style="
          width: 48px;
          height: 48px;
          background: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        ">🚀</div>
        <div style="font-weight: 600; color: #1e293b;">启动任务</div>
        <div style="font-size: 11px; color: #64748b;">点击开始执行</div>
      </div>
    \`,
  },
  style: {
    width: 120,
    height: 130,
  },
});

// 带输入框的表单节点
graph.addNode({
  id: 'html-form',
  label: '',
  x: 100,
  y: 260,
  shape: {
    type: Shape.HTML,
    html: \`
      <div>
        <div style="font-weight: 600; margin-bottom: 12px; color: #334155;">配置表单</div>
        <div style="margin-bottom: 8px;">
          <label style="font-size: 11px; color: #64748b; display: block; margin-bottom: 4px;">名称</label>
          <input type="text" value="Node-001" readonly style="
            width: 100%;
            padding: 6px 10px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            font-size: 12px;
            box-sizing: border-box;
          "/>
        </div>
        <div>
          <label style="font-size: 11px; color: #64748b; display: block; margin-bottom: 4px;">类型</label>
          <select disabled style="
            width: 100%;
            padding: 6px 10px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            font-size: 12px;
            background: white;
          ">
            <option>处理器</option>
            <option>数据源</option>
          </select>
        </div>
      </div>
    \`,
  },
  style: {
    width: 200,
    height: 160,
  },
});

// 进度指示器节点
graph.addNode({
  id: 'html-progress',
  label: '',
  x: 380,
  y: 260,
  shape: {
    type: Shape.HTML,
    html: \`
      <div>
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <div style="
            width: 32px;
            height: 32px;
            background: #22c55e;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
          ">✓</div>
          <div>
            <div style="font-weight: 600; color: #1e293b;">任务完成</div>
            <div style="font-size: 11px; color: #64748b;">处理成功</div>
          </div>
        </div>
        <div style="background: #f1f5f9; height: 6px; border-radius: 3px; overflow: hidden;">
          <div style="background: #22c55e; height: 100%; width: 100%; border-radius: 3px;"></div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #64748b; margin-top: 6px;">100%</div>
      </div>
    \`,
  },
  style: {
    width: 180,
    height: 120,
  },
});

console.log('🎨 HTML 自定义形状创建完成');
console.log('   - 支持任意 HTML 内容');
console.log('   - 可以包含表单、按钮、图表等');
console.log('   - 通过 style.width/height 设置尺寸');
console.log('   - 注意：HTML 节点内部交互需自行处理');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础形状', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '圆角与多边形', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '样式配置', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: 'HTML 自定义', code: EXAMPLE_4_CODE },
];

/**
 * ShapeExample - Shape 形状组件使用示例
 * 
 * 展示功能：
 * - 8 种内置形状类型
 * - 形状配置参数
 * - 形状样式设置
 * - 多边形自定义
 */
export const ShapeExample: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);

  // 执行用户代码并渲染 Graph
  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    graphContainerRef.current.innerHTML = '';

    try {
      const { Graph, Shape } = await import('../core');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        Shape,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Shape } = sandbox;
        ${codeToExecute}
      `;

      const fn = new Function('sandbox', executableCode);
      fn(sandbox);
    } catch (error) {
      console.error('代码执行错误:', error);
    }
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    codeRef.current = newCode;
  }, []);

  const handleRunCode = useCallback(() => {
    executeCode(codeRef.current);
  }, [executeCode]);

  const handleResetCode = useCallback(() => {
    const code = EXAMPLES[currentExample].code;
    codeRef.current = code;
    setEditorKey((prev) => prev + 1);
    executeCode(code);
  }, [currentExample, executeCode]);

  const switchExample = useCallback(
    (index: number) => {
      setCurrentExample(index);
      const code = EXAMPLES[index].code;
      codeRef.current = code;
      setEditorKey((prev) => prev + 1);
      executeCode(code);
    },
    [executeCode]
  );

  useEffect(() => {
    executeCode(EXAMPLE_1_CODE);
  }, [executeCode]);

  // 左侧面板 - 图例展示
  const LeftPanel = (
    <Panel>
      <PanelHeader icon="🎨" title="图例预览" hint="拖拽节点测试交互效果" />
      <div
        ref={graphContainerRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          background: '#f8fafc',
        }}
      />
    </Panel>
  );

  // 右侧面板 - 代码编辑
  const RightPanel = (
    <Panel>
      <PanelHeader icon="💻" title="代码编辑" />
      <PanelContent>
        <CodeEditor
          key={editorKey}
          value={EXAMPLES[currentExample].code}
          onUpdate={handleCodeChange}
          language="tsx"
        />
      </PanelContent>
      <PanelToolbar>
        <Button onClick={handleResetCode}>重置</Button>
        <Button type="primary" onClick={handleRunCode}>
          ▶ 运行代码
        </Button>
      </PanelToolbar>
    </Panel>
  );

  // 底部面板 - API 文档
  const BottomPanel = (
    <Panel>
      <PanelHeader icon="📋" title="API 文档" />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div id="shape-type-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            Shape 形状类型
          </h3>
          <Table columns={shapeTypeColumns} dataSource={shapeTypeData} pagination={false} />
        </div>
        <div id="shape-style-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            ShapeStyle - 形状样式配置
          </h3>
          <Table columns={shapeStyleColumns} dataSource={shapeStyleData} pagination={false} />
        </div>
        <div id="shape-html-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            Shape.HTML - HTML 自定义形状
          </h3>
          <Table
            columns={[
              { title: '属性名', dataIndex: 'name', width: 180 },
              { title: '类型', dataIndex: 'type', width: 150 },
              { title: '必填', dataIndex: 'required', width: 80 },
              { title: '说明', dataIndex: 'description' },
            ]}
            dataSource={[
              { name: 'type', type: 'Shape.HTML', required: '是', description: '形状类型固定为 HTML' },
              { name: 'html', type: 'string', required: '是', description: 'HTML 字符串内容' },
            ]}
            pagination={false}
          />
        </div>
        <div id="shape-usage-tips">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>使用提示</h3>
          <ul style={{ lineHeight: '1.8', color: '#475569' }}>
            <li><strong>多边形顶点：</strong>points 使用相对坐标，(0,0) 是中心点</li>
            <li><strong>圆角矩形：</strong>borderRadius 为宽/高的一半时呈现圆形效果</li>
            <li><strong>形状尺寸：</strong>Circle 的宽高应相等，Ellipse 可设置不同宽高</li>
            <li><strong>碰撞检测：</strong>所有形状都支持点是否在形状内的检测</li>
            <li><strong>锚点计算：</strong>形状支持根据位置获取边界锚点，用于边连接</li>
            <li><strong>HTML 形状：</strong>通过 html 属性传入 HTML 字符串，支持任意复杂 UI</li>
          </ul>
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="shape-example-title" style={{ height: '600px' }}>
        <PanelHeader title="Shape 形状组件示例" />
        {/* 示例切换按钮 */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 16px',
            background: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          {EXAMPLES.map((ex, index) => (
            <button
              key={ex.id}
              onClick={() => switchExample(index)}
              style={{
                padding: '6px 16px',
                background: currentExample === index ? '#3b82f6' : '#ffffff',
                color: currentExample === index ? '#ffffff' : '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              示例 {index + 1}: {ex.title}
            </button>
          ))}
        </div>
        <Splitter style={{ height: '100%' }}>
          {LeftPanel}
          {RightPanel}
        </Splitter>
      </div>
      {BottomPanel}
      {/* 浮动锚点 */}
      <div
        style={{
          position: 'fixed',
          right: '16px',
          top: '20%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Anchor affix={false} getContainer={() => document.body}>
          <Anchor.Link href="#shape-example-title" title="Shape 形状组件示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#shape-type-section" title="Shape 类型" />
          <Anchor.Link href="#shape-style-section" title="ShapeStyle 样式" />
          <Anchor.Link href="#shape-html-section" title="HTML 形状" />
          <Anchor.Link href="#shape-usage-tips" title="使用提示" />
        </Anchor>
      </div>
    </div>
  );
};

export default ShapeExample;
