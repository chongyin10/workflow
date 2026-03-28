import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Splitter, Table, Button } from '@zjpcy/simple-design';
import {
  CodeEditor,
  Panel,
  PanelHeader,
  PanelContent,
  PanelToolbar,
} from './components/CodeEditor';
import './styles/panel.css';

// ==================== API 文档数据 ====================

// ForceDirectedConfig 配置表格
const configColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 180 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const configData = [
  { name: 'enabled', type: 'boolean', default: 'true', description: '是否启用力导向布局' },
  { name: 'repulsion', type: 'number', default: '1000', description: '斥力系数，节点之间的排斥力' },
  { name: 'attraction', type: 'number', default: '0.01', description: '引力系数，边连接的节点之间的吸引力' },
  { name: 'centerGravity', type: 'number', default: '0.05', description: '中心引力，将节点拉向画布中心的力' },
  { name: 'maxIterations', type: 'number', default: '300', description: '最大迭代次数' },
  { name: 'minMovement', type: 'number', default: '0.1', description: '最小移动阈值，当节点移动小于此值时停止迭代' },
  { name: 'animationInterval', type: 'number', default: '16', description: '动画帧间隔（毫秒）' },
  { name: 'damping', type: 'number', default: '0.9', description: '阻尼系数，速度衰减' },
  { name: 'maxSpeed', type: 'number', default: '10', description: '最大速度限制' },
  { name: 'autoStart', type: 'boolean', default: 'true', description: '是否自动开始布局' },
  { name: 'onLayoutComplete', type: '() => void', default: '-', description: '布局完成回调' },
];

// 方法表格
const methodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 250 },
  { title: '参数', dataIndex: 'params', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const methodsData = [
  { name: 'layout()', params: '-', description: '开始力导向布局计算' },
  { name: 'stop()', params: '-', description: '停止布局动画' },
  { name: 'reset()', params: '-', description: '重置物理状态' },
  { name: 'fixNode(nodeId, fixed)', params: 'nodeId: string, fixed: boolean', description: '固定/释放节点位置' },
  { name: 'setOptions(options)', params: 'options: Partial<ForceDirectedOptions>', description: '更新配置' },
];

// ==================== 示例代码 ====================

// 示例 1: 基础力导向布局
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 350,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建力导向布局插件
const forceDirected = new ForceDirected({
  enabled: true,
  repulsion: 1500,
  attraction: 0.02,
  centerGravity: 0.08,
  autoStart: true,
});

graph.use(forceDirected);

// 创建星形结构
const centerId = 'center';
graph.addNode({
  id: centerId,
  label: 'Center',
  x: 350,
  y: 175,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
    borderRadius: 40,
    borderWidth: 2,
  },
});

// 添加卫星节点
const satelliteCount = 8;
for (let i = 0; i < satelliteCount; i++) {
  const angle = (i / satelliteCount) * Math.PI * 2;
  const distance = 120;
  const x = 350 + Math.cos(angle) * distance;
  const y = 175 + Math.sin(angle) * distance;

  const nodeId = 'satellite-' + i;
  graph.addNode({
    id: nodeId,
    label: 'Node ' + (i + 1),
    x: x,
    y: y,
    style: {
      width: 50,
      height: 50,
      backgroundColor: '#60a5fa',
      borderColor: '#3b82f6',
      textColor: '#ffffff',
      borderRadius: 25,
      borderWidth: 1.5,
    },
  });

  graph.addEdge({
    id: 'edge-' + i,
    source: centerId,
    target: nodeId,
    style: {
      stroke: '#94a3b8',
      strokeWidth: 1.5,
    },
  });
}

console.log('✅ 力导向布局示例');
console.log('   节点会自动调整位置达到平衡');
console.log('   可以拖拽节点来影响布局');`;

// 示例 2: 复杂网络图
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 350,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建力导向布局插件
const forceDirected = new ForceDirected({
  enabled: true,
  repulsion: 800,
  attraction: 0.015,
  centerGravity: 0.06,
  maxIterations: 500,
  damping: 0.85,
});

graph.use(forceDirected);

// 创建节点组
const groups = [
  { id: 'group-a', label: 'Group A', color: '#3b82f6', x: 200, y: 100 },
  { id: 'group-b', label: 'Group B', color: '#22c55e', x: 500, y: 100 },
  { id: 'group-c', label: 'Group C', color: '#f59e0b', x: 350, y: 250 },
];

// 添加主节点
const mainNodes = [];
groups.forEach((group) => {
  graph.addNode({
    id: group.id,
    label: group.label,
    x: group.x,
    y: group.y,
    style: {
      width: 80,
      height: 80,
      backgroundColor: group.color,
      borderColor: group.color,
      textColor: '#ffffff',
      borderRadius: 40,
      borderWidth: 3,
    },
  });
  mainNodes.push(group.id);
});

// 连接主节点
graph.addEdge({ id: 'edge-ab', source: 'group-a', target: 'group-b' });
graph.addEdge({ id: 'edge-bc', source: 'group-b', target: 'group-c' });
graph.addEdge({ id: 'edge-ca', source: 'group-c', target: 'group-a' });

// 为每个组添加子节点
const subNodeCount = 4;
mainNodes.forEach((parentId, groupIndex) => {
  const parentGroup = groups[groupIndex];

  for (let i = 0; i < subNodeCount; i++) {
    const nodeId = parentId + '-sub-' + i;
    graph.addNode({
      id: nodeId,
      label: String.fromCharCode(65 + i),
      x: parentGroup.x + (Math.random() - 0.5) * 80,
      y: parentGroup.y + (Math.random() - 0.5) * 80,
      style: {
        width: 35,
        height: 35,
        backgroundColor: parentGroup.color + '80',
        borderColor: parentGroup.color,
        textColor: '#ffffff',
        borderRadius: 17.5,
        borderWidth: 1.5,
      },
    });

    graph.addEdge({
      id: 'edge-' + parentId + '-' + nodeId,
      source: parentId,
      target: nodeId,
      style: {
        stroke: parentGroup.color,
        strokeWidth: 1,
      },
    });
  }
});

console.log('🌐 复杂网络图');
console.log('   三个组之间的连接关系');
console.log('   子节点围绕父节点分布');`;

// 示例 3: 层级树结构
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 350,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建力导向布局插件（适合树状结构）
const forceDirected = new ForceDirected({
  enabled: true,
  repulsion: 600,
  attraction: 0.03,
  centerGravity: 0.03,
  damping: 0.88,
});

graph.use(forceDirected);

// 创建根节点
const rootId = 'root';
graph.addNode({
  id: rootId,
  label: 'Root',
  x: 350,
  y: 60,
  style: {
    width: 70,
    height: 70,
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    textColor: '#ffffff',
    borderRadius: 35,
    borderWidth: 2,
  },
});

// 创建第二层节点
const level2Ids = [];
const level2Count = 3;
for (let i = 0; i < level2Count; i++) {
  const nodeId = 'level2-' + i;
  graph.addNode({
    id: nodeId,
    label: 'L2-' + (i + 1),
    x: 200 + i * 150,
    y: 150,
    style: {
      width: 50,
      height: 50,
      backgroundColor: '#f97316',
      borderColor: '#ea580c',
      textColor: '#ffffff',
      borderRadius: 25,
      borderWidth: 1.5,
    },
  });

  graph.addEdge({
    id: 'edge-root-' + nodeId,
    source: rootId,
    target: nodeId,
    style: {
      stroke: '#cbd5e1',
      strokeWidth: 2,
    },
  });

  level2Ids.push(nodeId);
}

// 创建第三层节点
const level3Colors = ['#fbbf24', '#84cc16', '#06b6d4'];
level2Ids.forEach((parentId, index) => {
  const childCount = 2;

  for (let i = 0; i < childCount; i++) {
    const nodeId = parentId + '-child-' + i;
    graph.addNode({
      id: nodeId,
      label: 'L3',
      x: 150 + index * 200 + (i - childCount / 2) * 40,
      y: 280,
      style: {
        width: 40,
        height: 40,
        backgroundColor: level3Colors[index],
        borderColor: level3Colors[index],
        textColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 1,
      },
    });

    graph.addEdge({
      id: 'edge-' + parentId + '-' + nodeId,
      source: parentId,
      target: nodeId,
      style: {
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
      },
    });
  }
});

console.log('🌳 层级树结构');
console.log('   根节点 -> 第二层 -> 第三层');
console.log('   力导向算法自动展开层级');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '⭐ 星形结构', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '🌐 复杂网络', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '🌳 层级树', code: EXAMPLE_3_CODE },
];

/**
 * ForceDirectedExample - 力导向布局插件使用示例
 */
export const ForceDirectedExample: React.FC = () => {
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
      const { Graph } = await import('../core/Graph');
      const { ForceDirected } = await import('../plugins/ForceDirected');

      // 创建容器样式
      const container = graphContainerRef.current;
      container.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
      `;

      const sandbox = {
        container,
        console: window.console,
        Graph,
        ForceDirected,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, ForceDirected } = sandbox;
        ${codeToExecute}
      `;

      const fn = new Function('sandbox', executableCode);
      fn(sandbox);
    } catch (error) {
      console.error('代码执行错误:', error);
      // 在容器中显示错误信息
      if (graphContainerRef.current) {
        graphContainerRef.current.innerHTML = `
          <div style="
            padding: 20px;
            color: #ef4444;
            font-family: monospace;
            font-size: 14px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            margin: 16px;
          ">
            <div style="font-weight: bold; margin-bottom: 8px;">❌ 代码执行错误</div>
            <div>${error instanceof Error ? error.message : String(error)}</div>
          </div>
        `;
      }
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
      <PanelHeader icon="🧲" title="力导向布局预览" hint="编辑代码后点击运行" />
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
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            ForceDirectedConfig - 配置参数
          </h3>
          <Table columns={configColumns} dataSource={configData} pagination={false} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            方法列表
          </h3>
          <Table columns={methodsColumns} dataSource={methodsData} pagination={false} />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div style={{ height: '500px' }}>
        <PanelHeader title="Force Directed 力导向布局示例" />
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
            <div key={ex.id} id={ex.id}>
              <button
                onClick={() => switchExample(index)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: currentExample === index ? '#3b82f6' : '#ffffff',
                  color: currentExample === index ? '#ffffff' : '#64748b',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                }}
              >
                {ex.title}
              </button>
            </div>
          ))}
        </div>
        <Splitter style={{ flex: 1, minHeight: 0 }}>
          {LeftPanel}
          {RightPanel}
        </Splitter>
      </div>
      {BottomPanel}
    </div>
  );
};

export default ForceDirectedExample;
