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

// ConnectionValidatorOptions 表格数据
const validatorOptionsColumns = [
  { title: '属性名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 200 },
  { title: '必填', dataIndex: 'required', width: 80 },
  { title: '默认值', dataIndex: 'default', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const validatorOptionsData = [
  { name: 'sourceNode', type: 'Node', required: '是', default: '-', description: '源节点实例' },
  { name: 'sourcePort', type: 'Port', required: '是', default: '-', description: '源端口实例' },
  { name: 'targetNode', type: 'Node', required: '是', default: '-', description: '目标节点实例' },
  { name: 'targetPort', type: 'Port', required: '是', default: '-', description: '目标端口实例' },
];

// ConnectionValidator 函数类型
const validatorTypeColumns = [
  { title: '类型', dataIndex: 'type', width: 300 },
  { title: '说明', dataIndex: 'description' },
];

const validatorTypeData = [
  { type: 'ConnectionValidator', description: '(context: ConnectionValidateContext) => boolean -返回 true 允许连接，返回 false 阻止连接' },
];

// ConnectionValidateContext 表格数据
const contextColumns = [
  { title: '属性名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 250 },
  { title: '说明', dataIndex: 'description' },
];

const contextData = [
  { name: 'sourceNode', type: 'Node', description: '源节点实例' },
  { name: 'sourcePort', type: 'Port', description: '源端口实例' },
  { name: 'targetNode', type: 'Node', description: '目标节点实例' },
  { name: 'targetPort', type: 'Port', description: '目标端口实例' },
];

// 验证规则示例
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
  // 连接验证回调
  validateConnection: ({ sourceNode, sourcePort, targetNode, targetPort }) => {
    // 规则1: 不允许连接到同一个节点
    if (sourceNode.getId() === targetNode.getId()) {
      console.log('❌ 不允许连接到同一个节点');
      return false;
    }

    // 规则2: 只允许右侧输出桩连接到左侧输入桩
    const sourcePos = sourcePort.getPosition();
    const targetPos = targetPort.getPosition();
    
    const isSourceRight = sourcePos === 'right';
    const isTargetLeft = targetPos === 'left';
    
    if (!isSourceRight || !isTargetLeft) {
      console.log('❌ 只允许右侧连接桩连接到左侧连接桩');
      return false;
    }

    console.log('✅ 允许连接');
    return true;
  },
});

// 创建源节点（右侧输出）
const node1 = graph.addNode({
  id: 'node-1',
  label: '输入节点',
  x: 80,
  y: 150,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 80,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
});

// 添加输出端口组
node1.addPortGroup({
  id: 'outputs',
  position: 'right',
  count: 2,
  portConfig: (index) => ({
    id: \`output-\${index}\`,
    label: \`输出 \${index + 1}\`,
  }),
});

// 创建处理节点（左侧输入，右侧输出）
const node2 = graph.addNode({
  id: 'node-2',
  label: '处理节点',
  x: 320,
  y: 150,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 100,
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    textColor: '#ffffff',
  },
});

// 添加输入端口组
node2.addPortGroup({
  id: 'inputs',
  position: 'left',
  count: 2,
  portConfig: (index) => ({
    id: \`input-\${index}\`,
    label: \`输入 \${index + 1}\`,
  }),
});

// 添加输出端口组
node2.addPortGroup({
  id: 'outputs',
  position: 'right',
  count: 1,
  portConfig: (index) => ({
    id: \`output-\${index}\`,
    label: \`输出 \${index + 1}\`,
  }),
});

// 创建目标节点（左侧输入）
const node3 = graph.addNode({
  id: 'node-3',
  label: '输出节点',
  x: 560,
  y: 150,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 80,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

// 添加输入端口组
node3.addPortGroup({
  id: 'inputs',
  position: 'left',
  count: 2,
  portConfig: (index) => ({
    id: \`input-\${index}\`,
    label: \`输入 \${index + 1}\`,
  }),
});

console.log('🎯 尝试连接节点，观察验证规则效果：');
console.log('   - 从 node-1 右侧输出端口拖拽到 node-2 左侧输入端口 ✓');
console.log('   - 尝试连接到同一节点会被拒绝 ✗');
console.log('   - 尝试反向连接（左→右）会被拒绝 ✗');`;

// 示例 2: 复杂验证规则
const EXAMPLE_2_CODE = `// 创建 Graph 画布（带复杂验证规则）
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
  validateConnection: ({ sourceNode, sourcePort, targetNode, targetPort }) => {
    const sourceId = sourceNode.getId();
    const targetId = targetNode.getId();
    const sourcePortId = sourcePort.getId();
    const targetPortId = targetPort.getId();
    
    // 规则1: 不允许自连接
    if (sourceId === targetId) {
      console.log('❌ 禁止自连接');
      return false;
    }
    
    // 规则2: 检查端口类型匹配
    const sourceType = sourceNode.getData()?.type || 'default';
    const targetType = targetNode.getData()?.type || 'default';
    
    // 数据源只能连接到处理器
    if (sourceType === 'data' && targetType !== 'processor') {
      console.log('❌ 数据源只能连接到处理器');
      return false;
    }
    
    // 规则3: 检查是否已存在连接
    const existingEdges = graph.getAllEdges();
    for (const edge of existingEdges) {
      const src = edge.getSource();
      const tgt = edge.getTarget();
      
      // 检查相同端口对
      if (src.portId === sourcePortId && tgt.portId === targetPortId) {
        console.log('❌ 端口对之间已存在连接');
        return false;
      }
      
      // 检查目标端口是否已被占用（单输入限制）
      if (tgt.portId === targetPortId) {
        console.log('❌ 目标端口已被占用');
        return false;
      }
    }
    
    console.log('✅ 验证通过，允许连接');
    return true;
  },
});

// 数据源节点
const dataSource = graph.addNode({
  id: 'data-source',
  label: '数据源',
  x: 80,
  y: 100,
  data: { type: 'data' },
  shape: Shape.Circle,
  style: {
    width: 90,
    height: 90,
    backgroundColor: '#0ea5e9',
    borderColor: '#0284c7',
    textColor: '#ffffff',
  },
});
dataSource.addPort({ id: 'out', position: 'right', visible: true });

// 处理器节点1
const processor1 = graph.addNode({
  id: 'processor-1',
  label: '处理器 A',
  x: 300,
  y: 80,
  data: { type: 'processor' },
  shape: Shape.Rect,
  style: {
    width: 110,
    height: 70,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
  },
});
processor1.addPort({ id: 'in', position: 'left', visible: true });
processor1.addPort({ id: 'out', position: 'right', visible: true });

// 处理器节点2
const processor2 = graph.addNode({
  id: 'processor-2',
  label: '处理器 B',
  x: 300,
  y: 200,
  data: { type: 'processor' },
  shape: Shape.Rect,
  style: {
    width: 110,
    height: 70,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
  },
});
processor2.addPort({ id: 'in', position: 'left', visible: true });
processor2.addPort({ id: 'out', position: 'right', visible: true });

// 输出节点
const output = graph.addNode({
  id: 'output',
  label: '输出',
  x: 520,
  y: 140,
  data: { type: 'output' },
  shape: Shape.Circle,
  style: {
    width: 90,
    height: 90,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});
output.addPort({ id: 'in', position: 'left', visible: true });

console.log('🔗 验证规则：');
console.log('   1. 数据源 → 处理器 ✓');
console.log('   2. 数据源 → 输出 ✗（必须经过处理器）');
console.log('   3. 同一端口不能重复连接 ✗');
console.log('   4. 目标端口被占用时不能连接 ✗');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础连接验证', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '复杂验证规则', code: EXAMPLE_2_CODE },
];

/**
 * ConnectionValidationExample - 连接验证示例
 * 
 * 展示功能：
 * - validateConnection 回调使用
 * - 自定义连接规则
 * - 端口类型匹配验证
 * - 防止重复连接
 */
export const ConnectionValidationExample: React.FC = () => {
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
      <PanelHeader icon="🔌" title="图例预览" hint="拖拽端口测试连接验证" />
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
        <div id="validator-options-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            validateConnection 参数
          </h3>
          <Table columns={validatorOptionsColumns} dataSource={validatorOptionsData} pagination={false} />
        </div>
        <div id="context-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            ConnectionValidateContext 上下文
          </h3>
          <Table columns={contextColumns} dataSource={contextData} pagination={false} />
        </div>
        <div id="usage-tips-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>使用提示</h3>
          <ul style={{ lineHeight: '1.8', color: '#475569' }}>
            <li><strong>返回值：</strong>返回 true 允许连接，返回 false 拒绝连接</li>
            <li><strong>异步支持：</strong>可以返回 {'Promise<boolean>'} 实现异步验证</li>
            <li><strong>常见场景：</strong>类型匹配、数量限制、循环检测、业务规则验证</li>
            <li><strong>性能注意：</strong>避免在回调中执行耗时操作，会影响拖拽流畅度</li>
            <li><strong>调试技巧：</strong>在回调中打印日志，便于观察验证时机和结果</li>
          </ul>
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="connection-validation-title" style={{ height: '600px' }}>
        <PanelHeader title="连接验证示例" />
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
          <Anchor.Link href="#connection-validation-title" title="连接验证示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#validator-options-section" title="验证参数" />
          <Anchor.Link href="#context-section" title="上下文对象" />
          <Anchor.Link href="#usage-tips-section" title="使用提示" />
        </Anchor>
      </div>
    </div>
  );
};

export default ConnectionValidationExample;
