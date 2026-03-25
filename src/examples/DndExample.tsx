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

// DndOptions 表格数据
const dndOptionsColumns = [
  { title: '属性名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 250 },
  { title: '必填', dataIndex: 'required', width: 80 },
  { title: '默认值', dataIndex: 'default', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const dndOptionsData = [
  { name: 'enabled', type: 'boolean', required: '否', default: 'true', description: '是否启用拖拽功能' },
  { name: 'dragClassName', type: 'string', required: '否', default: "'dnd-drag-preview'", description: '拖拽预览元素类名' },
  { name: 'dragStyle', type: 'Partial<CSSStyleDeclaration>', required: '否', default: '{...}', description: '拖拽预览元素样式' },
  { name: 'useCanvasPreview', type: 'boolean', required: '否', default: 'false', description: '是否使用 Canvas 绘制拖拽预览' },
  { name: 'previewNodeStyle', type: 'Partial<NodeStyle>', required: '否', default: '{...}', description: '拖拽预览节点样式（Canvas 模式）' },
  { name: 'allowOverlap', type: 'boolean', required: '否', default: 'true', description: '是否允许节点重叠放置' },
  { name: 'onDragStart', type: '(e: DndEvent) => void', required: '否', default: '-', description: '拖拽开始回调' },
  { name: 'onDrag', type: '(e: DndEvent) => void', required: '否', default: '-', description: '拖拽中回调' },
  { name: 'onDragEnter', type: '(e: DndEvent) => void', required: '否', default: '-', description: '进入画布回调' },
  { name: 'onDragOver', type: '(e: DndEvent) => void', required: '否', default: '-', description: '拖拽在画布上移动回调' },
  { name: 'onDragLeave', type: '(e: DndEvent) => void', required: '否', default: '-', description: '离开画布回调' },
  { name: 'onDrop', type: '(e: DndEvent) => boolean | void', required: '否', default: '-', description: '放置回调，返回 false 可阻止放置' },
  { name: 'onDragEnd', type: '(e: DndEvent) => void', required: '否', default: '-', description: '拖拽结束回调' },
  { name: 'validateDrop', type: '(position: Point, nodeOptions: NodeOptions) => boolean', required: '否', default: '-', description: '验证放置位置是否有效' },
  { name: 'transformNodeOptions', type: '(position: Point, nodeOptions: NodeOptions) => NodeOptions', required: '否', default: '-', description: '放置节点前的转换函数' },
];

// Dnd 类方法表格数据
const dndMethodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 220 },
  { title: '参数', dataIndex: 'params', width: 280 },
  { title: '返回值', dataIndex: 'return', width: 180 },
  { title: '说明', dataIndex: 'description' },
];

const dndMethodsData = [
  { key: '1', name: 'enable()', params: '-', return: 'void', description: '启用拖拽功能' },
  { key: '2', name: 'disable()', params: '-', return: 'void', description: '禁用拖拽功能' },
  { key: '3', name: 'isEnabled()', params: '-', return: 'boolean', description: '检查拖拽功能是否启用' },
  { key: '4', name: 'registerSource(element, config)', params: 'element: HTMLElement, config: DndSourceConfig', return: '() => void', description: '注册拖拽源元素，返回注销函数' },
  { key: '5', name: 'unregisterSource(element)', params: 'element: HTMLElement', return: 'void', description: '注销拖拽源元素' },
  { key: '6', name: 'unregisterAllSources()', params: '-', return: 'void', description: '注销所有拖拽源元素' },
  { key: '7', name: 'on(eventName, handler)', params: 'eventName: string, handler: EventHandler', return: '() => void', description: '注册事件监听器，返回注销函数' },
  { key: '8', name: 'off(eventName, handler?)', params: 'eventName: string, handler?: EventHandler', return: 'void', description: '注销事件监听器' },
];

// 节点模板配置
const NODE_TEMPLATES = [
  { id: 'rect-node', label: '矩形节点', color: '#3b82f6', shape: 'Rect', icon: '▭' },
  { id: 'circle-node', label: '圆形节点', color: '#22c55e', shape: 'Circle', icon: '○' },
  { id: 'diamond-node', label: '菱形节点', color: '#f59e0b', shape: 'Diamond', icon: '◇' },
  { id: 'process-node', label: '处理节点', color: '#8b5cf6', shape: 'Rect', icon: '⚙' },
  { id: 'decision-node', label: '判断节点', color: '#ec4899', shape: 'Diamond', icon: '?' },
  { id: 'start-node', label: '开始节点', color: '#10b981', shape: 'Circle', icon: '▶' },
];

// 示例 1: 基础拖拽
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建 Dnd 插件
const dnd = new Dnd({
  enabled: true,
  onDragStart: (e) => {
    console.log('🚀 拖拽开始:', e.nodeOptions?.label);
  },
  onDragEnter: () => {
    console.log('📥 进入画布区域');
  },
  onDragLeave: () => {
    console.log('📤 离开画布区域');
  },
  onDrop: (e) => {
    console.log('✅ 放置节点:', e.nodeOptions?.label, '位置:', e.position);
    return true; // 允许放置
  },
  onDragEnd: () => {
    console.log('🏁 拖拽结束');
  },
});

// 注册插件到 Graph
graph.use(dnd);

// 从左侧拖拽节点到画布中
// 拖拽源已在页面加载时注册到左侧工具栏节点上`;

// 示例 2: 拖拽源注册
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建 Dnd 插件
const dnd = new Dnd({
  enabled: true,
  onDrop: (e) => {
    console.log('放置:', e.nodeOptions?.label);
    return true;
  },
});

graph.use(dnd);

// 注册拖拽源的两种方式：

// 方式 1: 静态节点配置
// dnd.registerSource(domElement, {
//   id: 'static-node',
//   label: '静态节点',
//   x: 0,
//   y: 0,
//   style: {
//     backgroundColor: '#3b82f6',
//     borderColor: '#2563eb',
//   },
// });

// 方式 2: 动态节点配置（函数形式）
// dnd.registerSource(domElement, (e) => ({
//   id: \`node-\${Date.now()}\`,
//   label: '动态节点',
//   x: 0,
//   y: 0,
//   style: {
//     backgroundColor: '#22c55e',
//     borderColor: '#16a34a',
//   },
// }));

console.log('左侧工具栏的拖拽源已使用动态配置注册');`;

// 示例 3: 拖拽事件
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建带完整事件处理的 Dnd
const dnd = new Dnd({
  enabled: true,
  
  // 拖拽开始时
  onDragStart: (e) => {
    console.log('🟢 onDragStart');
    console.log('  - 拖拽节点:', e.nodeOptions?.label);
  },
  
  // 拖拽进行中（高频触发）
  onDrag: (e) => {
    // 可以在这里实时更新拖拽预览位置
  },
  
  // 进入画布区域
  onDragEnter: (e) => {
    console.log('🟦 onDragEnter: 进入画布区域');
  },
  
  // 离开画布区域
  onDragLeave: (e) => {
    console.log('🟥 onDragLeave: 离开画布区域');
  },
  
  // 放置时
  onDrop: (e) => {
    console.log('✅ onDrop');
    console.log('  - 放置位置:', e.position);
    console.log('  - 节点配置:', e.nodeOptions);
    return true; // 返回 true 允许放置
  },
  
  // 拖拽结束时
  onDragEnd: (e) => {
    console.log('🏁 onDragEnd: 拖拽结束');
  },
});

graph.use(dnd);

console.log('打开浏览器控制台查看完整事件日志');
console.log('从左侧拖拽节点到画布触发事件');`;

// 示例 4: 验证放置
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建带放置验证的 Dnd
const dnd = new Dnd({
  enabled: true,
  
  // 验证放置位置
  validateDrop: (position) => {
    // 只允许放置在 x > 150 的区域（右侧区域）
    const isValid = position.x > 150;
    if (!isValid) {
      console.log('❌ 放置被拒绝：位置 x 必须大于 150');
    }
    return isValid;
  },
  
  onDrop: (e) => {
    console.log('✅ 放置成功:', e.position);
    return true;
  },
});

graph.use(dnd);

// 添加区域标记 - 禁止放置区域
graph.addNode({
  id: 'forbidden-zone',
  label: '🚫 禁止放置区 (x < 150)',
  x: 75,
  y: 150,
  shape: Shape.Rect,
  style: {
    width: 140,
    height: 200,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
    borderWidth: 2,
    borderRadius: 4,
    textColor: '#ef4444',
  },
});

// 允许放置区域
graph.addNode({
  id: 'allowed-zone',
  label: '✅ 允许放置区 (x > 150)',
  x: 375,
  y: 150,
  shape: Shape.Rect,
  style: {
    width: 300,
    height: 200,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22c55e',
    borderWidth: 2,
    borderRadius: 4,
    textColor: '#22c55e',
  },
});

console.log('此示例展示了如何使用 validateDrop 验证放置位置');
console.log('尝试拖拽左侧节点到不同区域查看效果');`;

// 示例 5: 完整工作流
const EXAMPLE_5_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建 Dnd 插件
const dnd = new Dnd({
  enabled: true,
  onDrop: (e) => {
    console.log('添加节点:', e.nodeOptions?.label);
    return true;
  },
});

graph.use(dnd);

// 创建工作流模板节点
const workflowNodes = [
  { id: 'start', label: '开始', x: 100, y: 80, color: '#22c55e' },
  { id: 'process', label: '处理', x: 250, y: 80, color: '#3b82f6' },
  { id: 'decision', label: '判断', x: 400, y: 80, color: '#f59e0b' },
  { id: 'end', label: '结束', x: 250, y: 220, color: '#ef4444' },
];

workflowNodes.forEach((n) => {
  const node = graph.addNode({
    id: n.id,
    label: n.label,
    x: n.x,
    y: n.y,
    style: {
      backgroundColor: n.color,
      borderColor: n.color,
      textColor: '#ffffff',
    },
  });
  // 添加连接端口
  node.addPort({ id: \`\${n.id}-out\`, position: 'right', visible: true });
  node.addPort({ id: \`\${n.id}-in\`, position: 'left', visible: true });
});

// 创建连接边
graph.addEdge({
  id: 'edge-1',
  source: { nodeId: 'start', portId: 'start-out' },
  target: { nodeId: 'process', portId: 'process-in' },
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

graph.addEdge({
  id: 'edge-2',
  source: { nodeId: 'process', portId: 'process-out' },
  target: { nodeId: 'decision', portId: 'decision-in' },
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

graph.addEdge({
  id: 'edge-3',
  source: { nodeId: 'decision', portId: 'decision-out' },
  target: { nodeId: 'end', portId: 'end-in' },
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

console.log('工作流画布已创建');
console.log('从左侧拖拽工具栏添加更多节点到画布');`;

// 示例 6: 禁止叠加区域放置
const EXAMPLE_6_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建 Dnd 插件 - 禁止在已有节点上叠加放置
const dnd = new Dnd({
  enabled: true,
  // 关键配置：禁止节点重叠
  allowOverlap: false,
  
  onDrop: (e) => {
    console.log('✅ 放置成功:', e.nodeOptions?.label);
    console.log('   位置:', e.position);
    return true;
  },
});

graph.use(dnd);

// 预先放置几个节点作为障碍物
const obstacleNodes = [
  { id: 'node-1', label: '矩形节点', x: 150, y: 100, color: '#3b82f6' },
  { id: 'node-2', label: '圆形节点', x: 400, y: 100, color: '#22c55e', shape: Shape.Circle },
  { id: 'node-3', label: '菱形节点', x: 150, y: 200, color: '#f59e0b', shape: Shape.Diamond },
];

obstacleNodes.forEach((n) => {
  graph.addNode({
    id: n.id,
    label: n.label,
    x: n.x,
    y: n.y,
    shape: n.shape || Shape.Rect,
    style: {
      width: 100,
      height: 60,
      backgroundColor: n.color,
      borderColor: n.color,
      textColor: '#ffffff',
      borderRadius: n.shape === 'Circle' ? 50 : 6,
    },
  });
});

console.log('🚫 此示例禁止在已有节点区域放置新节点');
console.log('尝试拖拽左侧节点到已有节点上，会看到禁止提示');
console.log('尝试拖拽到空白区域，可以正常放置');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础拖拽', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '拖拽源注册', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '拖拽事件', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '放置验证', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '完整工作流', code: EXAMPLE_5_CODE },
  { id: 'example-6', title: '禁止叠加放置', code: EXAMPLE_6_CODE },
];

/**
 * 拖拽节点模板组件
 */
interface DragNodeTemplateProps {
  template: typeof NODE_TEMPLATES[0];
  onRef: (id: string, el: HTMLDivElement | null) => void;
}

function DragNodeTemplate({ template, onRef }: DragNodeTemplateProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onRef(template.id, elementRef.current);
    return () => {
      onRef(template.id, null);
    };
  }, [template.id, onRef]);

  return (
    <div
      ref={elementRef}
      draggable
      data-node-type={template.id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        marginBottom: '8px',
        background: '#ffffff',
        border: `2px solid ${template.color}`,
        borderRadius: '6px',
        cursor: 'grab',
        userSelect: 'none',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f8fafc';
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#ffffff';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
      onDragStart={(e) => {
        e.currentTarget.style.cursor = 'grabbing';
        e.currentTarget.style.opacity = '0.7';
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.cursor = 'grab';
        e.currentTarget.style.opacity = '1';
      }}
    >
      <span
        style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: template.color,
          color: '#ffffff',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {template.icon}
      </span>
      <span
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#1e293b',
        }}
      >
        {template.label}
      </span>
    </div>
  );
}

/**
 * DndExample - Dnd 拖拽插件使用示例
 */
export default function DndExample() {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const dndRef = useRef<any>(null);
  const graphRef = useRef<any>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);
  const dragSourceRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // 注册拖拽源
  const registerDragSources = useCallback((dnd: any) => {
    if (!dnd) return;

    NODE_TEMPLATES.forEach((template) => {
      const element = dragSourceRefs.current.get(template.id);
      if (element) {
        dnd.registerSource(element, (e: DragEvent) => ({
          id: `${template.id}-${Date.now()}`,
          label: template.label,
          x: 0,
          y: 0,
          shape: (globalThis as any).Shape?.[template.shape] || 'Rect',
          style: {
            width: 100,
            height: 60,
            backgroundColor: template.color,
            borderColor: template.color,
            textColor: '#ffffff',
            borderRadius: template.shape === 'Circle' ? 50 : 6,
          },
        }));
      }
    });
  }, []);

  // 执行用户代码并渲染 Graph
  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    graphContainerRef.current.innerHTML = '';
    dndRef.current = null;
    graphRef.current = null;

    try {
      const { Graph, Shape, EdgeType } = await import('../core');
      const { Dnd } = await import('../plugins');

      // 将 Shape 暴露到全局，供动态配置使用
      (globalThis as any).Shape = Shape;

      // 用于捕获代码中创建的 Graph 和 Dnd 实例
      let capturedGraph: any = null;
      let capturedDnd: any = null;

      // 包装 Dnd 构造函数以捕获实例
      const DndWrapper = class extends Dnd {
        constructor(options: any) {
          super(options);
          capturedDnd = this;
          dndRef.current = this;
        }
      };

      // 包装 Graph 构造函数以捕获实例
      const GraphWrapper = class extends Graph {
        constructor(options: any) {
          super(options);
          capturedGraph = this;
          graphRef.current = this;
        }
      };

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph: GraphWrapper,
        Shape,
        EdgeType,
        Dnd: DndWrapper,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Shape, EdgeType, Dnd } = sandbox;
        ${codeToExecute}
      `;

      const fn = new Function('sandbox', executableCode);
      fn(sandbox);

      // 代码执行后注册拖拽源
      if (capturedDnd) {
        registerDragSources(capturedDnd);
      } else if (capturedGraph) {
        // 如果没有直接捕获到 Dnd，尝试从 Graph 获取
        const dnd = capturedGraph.getPlugin('dnd');
        if (dnd) {
          dndRef.current = dnd;
          registerDragSources(dnd);
        }
      }
    } catch (error) {
      console.error('代码执行错误:', error);
    }
  }, [registerDragSources]);

  // 处理拖拽源元素引用
  const handleDragSourceRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      dragSourceRefs.current.set(id, el);
    } else {
      dragSourceRefs.current.delete(id);
    }
  }, []);

  // 重新注册拖拽源
  const reRegisterDragSources = useCallback(() => {
    if (dndRef.current) {
      registerDragSources(dndRef.current);
    }
  }, [registerDragSources]);

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

  // 左侧面板 - 拖拽节点工具栏 + 画布
  const LeftPanel = (
    <Panel>
      <PanelHeader icon="📊" title="拖拽画布" hint="从左侧拖拽节点到画布" />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 拖拽节点工具栏 */}
        <div
          style={{
            width: '140px',
            padding: '12px',
            background: '#f1f5f9',
            borderRight: '1px solid #e2e8f0',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            拖拽节点
          </div>
          {NODE_TEMPLATES.map((template) => (
            <DragNodeTemplate
              key={template.id}
              template={template}
              onRef={handleDragSourceRef}
            />
          ))}
          <div
            style={{
              marginTop: '16px',
              padding: '10px',
              background: '#e0f2fe',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#0369a1',
              lineHeight: 1.5,
            }}
          >
            💡 提示：拖拽上方节点到右侧画布中
          </div>
        </div>
        {/* 画布区域 */}
        <div
          ref={graphContainerRef}
          style={{
            flex: 1,
            overflow: 'hidden',
            background: '#f8fafc',
          }}
        />
      </div>
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
        <div id="dnd-options-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            DndOptions - 拖拽配置选项
          </h3>
          <Table columns={dndOptionsColumns} dataSource={dndOptionsData} pagination={false} />
        </div>
        <div id="dnd-methods-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>Dnd 类方法</h3>
          <Table columns={dndMethodsColumns} dataSource={dndMethodsData} pagination={false} />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="dnd-example-title" style={{ height: '600px' }}>
        <PanelHeader title="Dnd 拖拽示例" />
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
          <Anchor.Link href="#dnd-example-title" title="Dnd 拖拽示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#dnd-options-section" title="DndOptions" />
          <Anchor.Link href="#dnd-methods-section" title="Dnd 类方法" />
        </Anchor>
      </div>
    </div>
  );
}
