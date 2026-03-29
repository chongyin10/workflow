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

// GroupCell 配置表格
const groupCellConfigColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 180 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const groupCellConfigData = [
  { name: 'enabled', type: 'boolean', default: 'true', description: '是否启用群组功能' },
  { name: 'recursiveMove', type: 'boolean', default: 'true', description: '是否递归移动子节点' },
  { name: 'syncEdgeMove', type: 'boolean', default: 'true', description: '是否同步移动相关边' },
  { name: 'autoEmbed', type: 'boolean', default: 'true', description: '是否自动嵌入（节点移动到 group 类型节点内部时自动成为子节点）' },
  { name: 'onBeforeParentMove', type: '(node, delta) => boolean', default: '-', description: '父节点移动前回调，返回 false 可阻止移动' },
  { name: 'onAfterParentMove', type: '(node, delta) => void', default: '-', description: '父节点移动后回调' },
  { name: 'onChildEmbed', type: '(child, parent) => void', default: '-', description: '子节点嵌入父节点时回调' },
  { name: 'onChildUnembed', type: '(child, parent) => void', default: '-', description: '子节点移出父节点时回调' },
];

// 方法表格
const groupCellMethodColumns = [
  { title: '方法名', dataIndex: 'method', width: 250 },
  { title: '参数', dataIndex: 'params', width: 300 },
  { title: '返回值', dataIndex: 'return', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const groupCellMethodData = [
  { method: 'setParent(child, parent, embed)', params: 'Node, Node | null, boolean', return: 'void', description: '设置节点的父节点（手动绑定，autoEmbed 为 false 时使用）' },
  { method: 'removeFromParent(child)', params: 'Node', return: 'void', description: '移除节点的父节点关系' },
  { method: 'getParent(node)', params: 'Node', return: 'Node | null', description: '获取节点的父节点' },
  { method: 'getChildren(parent)', params: 'Node', return: 'Node[]', description: '获取节点的子节点列表' },
  { method: 'isEmbedded(node)', params: 'Node', return: 'boolean', description: '检查节点是否是嵌入状态' },
  { method: 'setEmbedded(node, embedded)', params: 'Node, boolean', return: 'void', description: '设置节点的嵌入状态' },
  { method: 'getEdgeParent(edge)', params: 'Edge', return: 'Node | null', description: '获取边的共同父节点' },
  { method: 'isAncestor(ancestor, descendant)', params: 'string, string', return: 'boolean', description: '检查是否是祖先节点' },
  { method: 'getAncestors(node)', params: 'Node', return: 'Node[]', description: '获取节点的所有祖先' },
  { method: 'getDescendants(node)', params: 'Node', return: 'Node[]', description: '获取节点的所有后代' },
  { method: 'ungroup(parent)', params: 'Node', return: 'void', description: '取消父节点的所有子关系' },
];

// Node 类型方法表格
const nodeTypeMethodColumns = [
  { title: '方法名', dataIndex: 'method', width: 250 },
  { title: '参数', dataIndex: 'params', width: 300 },
  { title: '返回值', dataIndex: 'return', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const nodeTypeMethodData = [
  { method: 'getType()', params: '-', return: "'node' | 'group'", description: '获取节点类型' },
  { method: 'setType(type)', params: "'node' | 'group'", return: 'void', description: '设置节点类型为普通节点或群组节点' },
  { method: 'isGroup()', params: '-', return: 'boolean', description: '检查节点是否为群组类型' },
];

// 示例 1: 自动嵌入群组（推荐）
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建 GroupCell 插件（启用自动嵌入）
const groupCell = new GroupCell({
  enabled: true,
  recursiveMove: true,
  syncEdgeMove: true,
  autoEmbed: true,  // 启用自动嵌入
});

// 安装插件
graph.use(groupCell);

// 创建 group 类型节点（容器）
const group = graph.addNode({
  id: 'group',
  type: 'group',  // 设置为 group 类型
  label: 'Group Container',
  x: 350,
  y: 200,
  style: {
    width: 280,
    height: 180,
    backgroundColor: '#f0f9ff',
    borderColor: '#3b82f6',
    borderWidth: 2,
    borderRadius: 12,
    textColor: '#1e40af',
  },
});

// 创建普通节点（初始在 group 外部）
const node1 = graph.addNode({
  id: 'node-1',
  type: 'node',
  label: 'Node 1',
  x: 120,
  y: 200,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#ffffff',
    borderColor: '#64748b',
    borderWidth: 1.5,
    borderRadius: 8,
  },
});

// 创建普通节点（初始在 group 内部）
const node2 = graph.addNode({
  id: 'node-2',
  type: 'node',
  label: 'Node 2',
  x: 420,
  y: 200,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#ffffff',
    borderColor: '#22c55e',
    borderWidth: 1.5,
    borderRadius: 8,
  },
});

// 创建连接边
graph.addEdge({
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  style: {
    stroke: '#64748b',
    strokeWidth: 1.5,
  },
});

console.log('✅ 自动嵌入群组示例');
console.log('   1. 将 Node 1 拖动到 Group 内部 → 自动成为子节点');
console.log('   2. 将 Node 2 拖出 Group → 自动解除父子关系');
console.log('   3. 拖动 Group → 内部所有节点跟随移动');`;

// 示例 2: 多层嵌套群组（自动嵌入）
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建 GroupCell 插件（启用自动嵌入）
const groupCell = new GroupCell({
  enabled: true,
  recursiveMove: true,
  autoEmbed: true,  // 启用自动嵌入
});

graph.use(groupCell);

// 创建祖父节点（Group A）
const grandparent = graph.addNode({
  id: 'grandparent',
  type: 'group',  // 设置为 group 类型
  label: 'Group A',
  x: 350,
  y: 200,
  style: {
    width: 320,
    height: 240,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 2,
    borderRadius: 12,
    textColor: '#92400e',
  },
});

// 创建父节点（Group B）
const parent = graph.addNode({
  id: 'parent',
  type: 'group',  // 设置为 group 类型
  label: 'Group B',
  x: 350,
  y: 180,
  style: {
    width: 200,
    height: 140,
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderWidth: 2,
    borderRadius: 10,
    textColor: '#1e40af',
  },
});

// 创建叶子节点
const leaf1 = graph.addNode({
  id: 'leaf-1',
  type: 'node',
  label: 'Node 1',
  x: 300,
  y: 160,
  style: {
    width: 80,
    height: 40,
    backgroundColor: '#ffffff',
    borderColor: '#22c55e',
    borderWidth: 1.5,
    borderRadius: 6,
  },
});

const leaf2 = graph.addNode({
  id: 'leaf-2',
  type: 'node',
  label: 'Node 2',
  x: 400,
  y: 200,
  style: {
    width: 80,
    height: 40,
    backgroundColor: '#ffffff',
    borderColor: '#ec4899',
    borderWidth: 1.5,
    borderRadius: 6,
  },
});

// 连接节点
graph.addEdge({
  id: 'edge-1',
  source: 'leaf-1',
  target: 'leaf-2',
  style: { stroke: '#94a3b8', strokeWidth: 1.5 },
});

console.log('🏗️ 多层嵌套群组示例（自动嵌入）');
console.log('   1. 将 Group B 拖动到 Group A 内部 → Group B 成为 Group A 的子节点');
console.log('   2. 将 Node 1, Node 2 拖动到 Group B 内部 → 成为 Group B 的子节点');
console.log('   3. 拖动 Group A，所有嵌套节点都会跟随移动');`;

// 示例 3: 边的父节点跟随（自动嵌入）
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建 GroupCell 插件（启用边同步移动和自动嵌入）
const groupCell = new GroupCell({
  enabled: true,
  recursiveMove: true,
  syncEdgeMove: true,
  autoEmbed: true,  // 启用自动嵌入
});

graph.use(groupCell);

// 创建父节点
const parent = graph.addNode({
  id: 'parent',
  type: 'group',  // 设置为 group 类型
  label: 'Parent Group',
  x: 350,
  y: 200,
  style: {
    width: 300,
    height: 200,
    backgroundColor: '#f3e8ff',
    borderColor: '#8b5cf6',
    borderWidth: 2,
    borderRadius: 12,
    textColor: '#6b21a8',
  },
});

// 创建两个子节点
const node1 = graph.addNode({
  id: 'node-1',
  type: 'node',
  label: 'Source',
  x: 250,
  y: 180,
  style: {
    width: 80,
    height: 50,
    backgroundColor: '#ffffff',
    borderColor: '#3b82f6',
    borderWidth: 1.5,
    borderRadius: 8,
  },
});

const node2 = graph.addNode({
  id: 'node-2',
  type: 'node',
  label: 'Target',
  x: 450,
  y: 220,
  style: {
    width: 80,
    height: 50,
    backgroundColor: '#ffffff',
    borderColor: '#22c55e',
    borderWidth: 1.5,
    borderRadius: 8,
  },
});

// 连接两个子节点
const edge = graph.addEdge({
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  style: {
    stroke: '#8b5cf6',
    strokeWidth: 2,
  },
});

console.log('🔗 边的父节点跟随示例（自动嵌入）');
console.log('   1. 将 Source 和 Target 拖动到 Parent Group 内部');
console.log('   2. 自动成为子节点后，边被视为属于该父节点');
console.log('   3. 拖动 Parent Group，边会跟随移动（包括路径点）');`;

// 示例 4: 动态嵌入/非嵌入（自动嵌入回调）
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建 GroupCell 插件（启用自动嵌入和回调）
const groupCell = new GroupCell({
  enabled: true,
  recursiveMove: true,
  autoEmbed: true,  // 启用自动嵌入
  onChildEmbed: (child, parent) => {
    console.log('🟢 子节点嵌入:', child.getLabel(), '->', parent.getLabel());
    // 可以在这里添加视觉效果，如改变边框颜色
    child.updateStyle({ borderColor: '#22c55e' });
  },
  onChildUnembed: (child, parent) => {
    console.log('🔴 子节点移出:', child.getLabel(), '<-', parent.getLabel());
    // 恢复样式
    child.updateStyle({ borderColor: '#64748b' });
  },
});

graph.use(groupCell);

// 创建父节点
const parent = graph.addNode({
  id: 'parent',
  type: 'group',  // 设置为 group 类型
  label: 'Parent',
  x: 400,
  y: 200,
  style: {
    width: 250,
    height: 180,
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    borderWidth: 2,
    borderRadius: 12,
  },
});

// 创建子节点
const child = graph.addNode({
  id: 'child',
  type: 'node',
  label: 'Child',
  x: 150,
  y: 200,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#ffffff',
    borderColor: '#64748b',
    borderWidth: 1.5,
    borderRadius: 8,
  },
});

console.log('🔄 动态嵌入/非嵌入示例（自动嵌入）');
console.log('   1. 将 Child 拖动到 Parent 内部 → 自动嵌入，触发 onChildEmbed');
console.log('   2. 将 Child 拖出 Parent → 自动解除，触发 onChildUnembed');
console.log('   3. 观察边框颜色变化（绿色=嵌入，灰色=未嵌入）');
console.log('   4秒后：切换为非嵌入状态，触发 onChildUnembed');`;

// 示例 5: 群组操作 API（自动嵌入）
const EXAMPLE_5_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建 GroupCell 插件（启用自动嵌入）
const groupCell = new GroupCell({
  enabled: true,
  recursiveMove: true,
  autoEmbed: true,  // 启用自动嵌入
});

graph.use(groupCell);

// 创建根节点（group 类型）
const root = graph.addNode({
  id: 'root',
  type: 'group',  // 设置为 group 类型
  label: 'Root Group',
  x: 350,
  y: 200,
  style: {
    width: 300,
    height: 220,
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
    borderWidth: 2,
    borderRadius: 12,
  },
});

// 创建子节点 A 和 B
const nodeA = graph.addNode({
  id: 'node-a',
  type: 'node',
  label: 'Node A',
  x: 280,
  y: 160,
  style: {
    width: 80,
    height: 50,
    backgroundColor: '#ffffff',
    borderColor: '#3b82f6',
    borderWidth: 1.5,
    borderRadius: 8,
  },
});

const nodeB = graph.addNode({
  id: 'node-b',
  type: 'node',
  label: 'Node B',
  x: 420,
  y: 160,
  style: {
    width: 80,
    height: 50,
    backgroundColor: '#ffffff',
    borderColor: '#22c55e',
    borderWidth: 1.5,
    borderRadius: 8,
  },
});

console.log('📚 群组 API 演示（自动嵌入）');
console.log('========================');
console.log('');
console.log('操作指南：');
console.log('   1. 将 Node A 和 Node B 拖动到 Root Group 内部');
console.log('   2. 观察 API 输出变化');
console.log('');

// 延迟执行 API 演示，等待嵌入完成
setTimeout(() => {
  // 获取父节点
  const parentOfA = groupCell.getParent(nodeA);
  console.log('Node A 的父节点:', parentOfA?.getLabel() || '无');

  // 获取子节点
  const children = groupCell.getChildren(root);
  console.log('Root 的子节点:', children.map(n => n.getLabel()).join(', ') || '无');

  // 检查祖先
  const isRootAncestorOfA = groupCell.isAncestor(root.getId(), nodeA.getId());
  console.log('Root 是 Node A 的祖先:', isRootAncestorOfA);

  // 获取所有后代
  const descendants = groupCell.getDescendants(root);
  console.log('Root 的所有后代:', descendants.map(n => n.getLabel()).join(', ') || '无');

  // 获取群组统计
  const stats = groupCell.getStats();
  console.log('群组统计:', stats);

  // 获取所有根节点
  const roots = groupCell.getRootNodes();
  console.log('所有根节点:', roots.map(n => n.getLabel()).join(', '));

  // 获取群组所有节点（包括父节点）
  const groupNodes = groupCell.getGroupNodes(root);
  console.log('群组包含的所有节点:', groupNodes.map(n => n.getLabel()).join(', '));
}, 1000);

console.log('🎯 尝试将节点拖动到 Root Group 内部，观察自动嵌入效果');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '自动嵌入基础', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '多层嵌套自动嵌入', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '边的父节点跟随', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '动态嵌入回调', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '群组 API 演示', code: EXAMPLE_5_CODE },
];

export const GroupCellExample: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);

  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    graphContainerRef.current.innerHTML = '';

    try {
      const { Graph } = await import('../core');
      const { GroupCell } = await import('../plugins');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        GroupCell,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, GroupCell } = sandbox;
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

  const LeftPanel = (
    <Panel>
      <PanelHeader icon="🔗" title="群组演示" hint="拖动父节点查看子节点跟随效果" />
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

  const BottomPanel = (
    <Panel>
      <PanelHeader icon="📋" title="API 文档" />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div id="groupcell-intro-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            GroupCell 简介
          </h3>
          <p style={{ lineHeight: '1.8', color: '#475569' }}>
            GroupCell 插件通过父子关系实现群组功能。支持<strong>自动嵌入</strong>和<strong>手动绑定</strong>两种模式。
            当节点定义为 group 类型时，其他节点移动到其内部区域会自动成为子节点；拖动 group 节点时，内部所有节点跟随移动。
            也支持通过 setParent 手动建立父子关系。
          </p>
        </div>

        <div id="groupcell-config-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            GroupCell 配置选项
          </h3>
          <Table columns={groupCellConfigColumns} dataSource={groupCellConfigData} pagination={false} />
        </div>

        <div id="groupcell-method-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            主要方法
          </h3>
          <Table columns={groupCellMethodColumns} dataSource={groupCellMethodData} pagination={false} />
        </div>

        <div id="groupcell-node-type-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            Node 类型方法
          </h3>
          <Table columns={nodeTypeMethodColumns} dataSource={nodeTypeMethodData} pagination={false} />
        </div>

        <div id="groupcell-api-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            控制方法
          </h3>
          <Table
            columns={[
              { title: '方法名', dataIndex: 'method', width: 250 },
              { title: '说明', dataIndex: 'description' },
            ]}
            dataSource={[
              { method: 'graph.use(groupCell)', description: '安装群组插件到 Graph 实例' },
              { method: 'groupCell.enable()', description: '启用群组功能' },
              { method: 'groupCell.disable()', description: '禁用群组功能' },
              { method: 'groupCell.isEnabled()', description: '获取群组功能是否启用' },
              { method: 'groupCell.setOptions(options)', description: '更新插件配置' },
              { method: 'groupCell.getOptions()', description: '获取当前配置' },
              { method: 'groupCell.clear()', description: '清空所有父子关系' },
              { method: 'groupCell.getStats()', description: '获取群组统计信息' },
            ]}
            pagination={false}
          />
        </div>

        <div id="groupcell-concept-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            核心概念
          </h3>
          <ul style={{ lineHeight: '1.8', color: '#475569' }}>
            <li><strong>自动嵌入：</strong>当 autoEmbed 为 true 时，节点移动到 group 类型节点内部会自动成为其子节点</li>
            <li><strong>节点类型：</strong>Node 可以是 'node'（普通节点）或 'group'（群组容器）类型</li>
            <li><strong>手动绑定：</strong>通过 setParent 手动建立节点间的层级关系，适用于 autoEmbed 关闭时</li>
            <li><strong>嵌入状态：</strong>节点可以处于嵌入或非嵌入状态，嵌入状态表示节点在父节点内部</li>
            <li><strong>递归移动：</strong>移动父节点时，所有层级子节点都会跟随移动</li>
            <li><strong>边的父节点：</strong>边的起点和终点有共同父节点时，该边被视为属于该父节点</li>
            <li><strong>循环检测：</strong>设置父节点时会自动检测循环依赖，防止形成闭环</li>
          </ul>
        </div>

        <div id="groupcell-usage-tips">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>使用提示</h3>
          <ul style={{ lineHeight: '1.8', color: '#475569' }}>
            <li><strong>推荐用法：</strong>使用 type: 'group' 定义容器节点，配合 autoEmbed: true 实现自动绑定</li>
            <li><strong>视觉反馈：</strong>建议使用不同的边框颜色或背景色区分 group 节点和普通节点</li>
            <li><strong>事件监听：</strong>使用 onChildEmbed 和 onChildUnembed 处理嵌入状态变化</li>
            <li><strong>取消群组：</strong>使用 ungroup 方法可以快速取消一个父节点的所有子关系</li>
            <li><strong>统计信息：</strong>使用 getStats 获取当前群组的整体情况</li>
          </ul>
        </div>
      </div>
    </Panel>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: '600px' }}>
        <PanelHeader title="GroupCell 群组插件示例" />
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
          <Anchor.Link href="#groupcell-example-title" title="GroupCell 群组示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#groupcell-intro-section" title="插件简介" />
          <Anchor.Link href="#groupcell-config-section" title="配置选项" />
          <Anchor.Link href="#groupcell-method-section" title="主要方法" />
          <Anchor.Link href="#groupcell-api-section" title="控制方法" />
          <Anchor.Link href="#groupcell-concept-section" title="核心概念" />
          <Anchor.Link href="#groupcell-usage-tips" title="使用提示" />
        </Anchor>
      </div>
    </div>
  );
};

export default GroupCellExample;
