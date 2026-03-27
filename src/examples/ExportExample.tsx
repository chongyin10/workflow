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

// 导出配置选项表格数据
const exportOptionsColumns = [
  { title: '属性名', dataIndex: 'name', width: 140 },
  { title: '类型', dataIndex: 'type', width: 180 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const exportOptionsData = [
  { name: 'format', type: "'png' | 'jpeg' | 'svg'", default: "'png'", description: '导出图片格式' },
  { name: 'quality', type: 'number (0-1)', default: '1', description: '导出图片质量，仅对 jpeg 有效' },
  { name: 'width', type: 'number | string', default: '画布宽度', description: '导出图片宽度，未设置时为 100%' },
  { name: 'height', type: 'number | string', default: '画布高度', description: '导出图片高度，未设置时为 100%' },
  { name: 'backgroundColor', type: 'string', default: '-', description: '背景颜色，默认透明（png/svg）或白色（jpeg）' },
  { name: 'scale', type: 'number', default: '1', description: '缩放比例' },
  { name: 'includeGrid', type: 'boolean', default: 'false', description: '是否包含网格背景' },
  { name: 'padding', type: 'number', default: '10', description: '导出区域的内边距' },
];

// SVG 导出选项表格数据
const svgOptionsColumns = [
  { title: '属性名', dataIndex: 'name', width: 140 },
  { title: '类型', dataIndex: 'type', width: 180 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const svgOptionsData = [
  { name: 'width', type: 'number | string', default: '画布宽度', description: 'SVG 宽度，未设置时为 100%' },
  { name: 'height', type: 'number | string', default: '画布高度', description: 'SVG 高度，未设置时为 100%' },
  { name: 'scale', type: 'number', default: '1', description: '缩放比例' },
  { name: 'copyStyles', type: 'boolean', default: 'true', description: '是否复制外部样式表中的样式到 SVG' },
  { name: 'extraStyles', type: 'string', default: '-', description: '额外的 CSS 样式字符串' },
  { name: 'backgroundColor', type: 'string', default: '-', description: '背景颜色' },
];

// 导出方法表格数据
const exportMethodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 280 },
  { title: '返回值', dataIndex: 'return', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const exportMethodsData = [
  { name: 'exportPlugin.toPNG(options)', return: 'string (Data URL)', description: '导出为 PNG 格式图片' },
  { name: 'exportPlugin.toJPEG(options)', return: 'string (Data URL)', description: '导出为 JPEG 格式图片' },
  { name: 'exportPlugin.toSVG(options)', return: 'string (SVG XML)', description: '导出为 SVG 矢量格式' },
  { name: 'exportPlugin.toBlob(options)', return: 'Promise<Blob>', description: '导出为 Blob 对象' },
  { name: 'exportPlugin.download(filename, options)', return: 'void', description: '下载导出的图片文件' },
  { name: 'exportPlugin.getContentBounds(padding)', return: '{ x, y, width, height } | null', description: '获取画布内容的边界框' },
  { name: 'exportPlugin.exportRegion(bounds, options)', return: 'string (Data URL)', description: '导出指定区域为图片' },
];

// 示例 1: 基础导出
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建导出插件
const exportPlugin = new Export();
graph.use(exportPlugin);

// 创建示例节点
graph.addNode({
  id: 'start',
  label: '开始',
  x: 100,
  y: 150,
  shape: 'circle',
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

graph.addNode({
  id: 'process',
  label: '处理',
  x: 250,
  y: 150,
  style: {
    width: 120,
    height: 60,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
});

graph.addNode({
  id: 'decision',
  label: '判断',
  x: 450,
  y: 150,
  shape: 'diamond',
  style: {
    width: 100,
    height: 100,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
  },
});

graph.addNode({
  id: 'end',
  label: '结束',
  x: 600,
  y: 150,
  shape: 'circle',
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    textColor: '#ffffff',
  },
});

// 创建连线
graph.addEdge({
  id: 'edge-1',
  source: 'start',
  target: 'process',
  style: { stroke: '#64748b', strokeWidth: 2 },
});

graph.addEdge({
  id: 'edge-2',
  source: 'process',
  target: 'decision',
  style: { stroke: '#64748b', strokeWidth: 2 },
});

graph.addEdge({
  id: 'edge-3',
  source: 'decision',
  target: 'end',
  style: { stroke: '#64748b', strokeWidth: 2 },
});

console.log('✅ 基础导出示例');
console.log('   使用 exportPlugin.toPNG() 导出 PNG 图片');
console.log('   使用 exportPlugin.download() 下载图片文件');`;

// 示例 2: 导出不同格式
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: {
    enabled: true,
    size: 20,
    color: '#e5e7eb',
    type: 'mesh',
  },
});

// 创建导出插件
const exportPlugin = new Export();
graph.use(exportPlugin);

// 创建示例节点
const colors = [
  { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
];

for (let i = 0; i < 4; i++) {
  graph.addNode({
    id: 'node-' + (i + 1),
    label: '节点 ' + (i + 1),
    x: 80 + i * 160,
    y: 150 + (i % 2) * 100,
    style: {
      width: 100,
      height: 60,
      backgroundColor: colors[i].bg,
      borderColor: colors[i].border,
      textColor: colors[i].text,
      borderRadius: 8,
      borderWidth: 2,
    },
  });
}

// 连接节点
for (let i = 0; i < 3; i++) {
  graph.addEdge({
    id: 'edge-' + (i + 1),
    source: 'node-' + (i + 1),
    target: 'node-' + (i + 2),
    style: { stroke: '#94a3b8', strokeWidth: 2 },
  });
}

console.log('🎨 多格式导出示例');
console.log('');
console.log('// PNG 格式（支持透明背景）');
console.log('const pngDataUrl = exportPlugin.toPNG({ scale: 2 });');
console.log('');
console.log('// JPEG 格式（白色背景）');
console.log('const jpegDataUrl = exportPlugin.toJPEG({ quality: 0.9 });');
console.log('');
console.log('// SVG 格式（矢量图）');
console.log('const svgString = exportPlugin.toSVG({ copyStyles: true });');
console.log('');
console.log('// 直接下载');
console.log('exportPlugin.download("flowchart.png", { format: "png", scale: 2 });');`;

// 示例 3: SVG 导出（含样式）
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f0f9ff',
});

// 创建导出插件
const exportPlugin = new Export();
graph.use(exportPlugin);

// 创建复杂样式的节点
graph.addNode({
  id: 'styled-1',
  label: '样式节点 1',
  x: 100,
  y: 100,
  style: {
    width: 140,
    height: 80,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderColor: '#5a67d8',
    textColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 3,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

graph.addNode({
  id: 'styled-2',
  label: '样式节点 2',
  x: 300,
  y: 100,
  style: {
    width: 140,
    height: 80,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#92400e',
    borderRadius: 12,
    borderWidth: 3,
    fontSize: 16,
  },
});

graph.addNode({
  id: 'styled-3',
  label: '样式节点 3',
  x: 500,
  y: 100,
  style: {
    width: 140,
    height: 80,
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
    borderRadius: 12,
    borderWidth: 3,
    fontSize: 16,
  },
});

// 创建连接线
graph.addEdge({
  id: 'styled-edge-1',
  source: 'styled-1',
  target: 'styled-2',
  style: { 
    stroke: '#5a67d8', 
    strokeWidth: 3,
    strokeDasharray: '5,5',
  },
});

graph.addEdge({
  id: 'styled-edge-2',
  source: 'styled-2',
  target: 'styled-3',
  style: { 
    stroke: '#f59e0b', 
    strokeWidth: 3,
  },
});

console.log('📄 SVG 导出示例');
console.log('');
console.log('// 默认配置：复制外部样式表中的样式');
console.log('const svg1 = exportPlugin.toSVG();');
console.log('');
console.log('// 自定义尺寸（未设置时使用 100%）');
console.log('const svg2 = exportPlugin.toSVG({');
console.log('  width: 800,');
console.log('  height: 600,');
console.log('});');
console.log('');
console.log('// 不复制外部样式');
console.log('const svg3 = exportPlugin.toSVG({');
console.log('  copyStyles: false,');
console.log('});');
console.log('');
console.log('// 添加额外样式');
console.log('const svg4 = exportPlugin.toSVG({');
console.log('  extraStyles: "text { font-family: Arial; }",');
console.log('});');`;

// 示例 4: 高分辨率导出
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#ffffff',
});

// 创建导出插件
const exportPlugin = new Export();
graph.use(exportPlugin);

// 创建复杂流程图
const nodes = [
  { id: 'n1', label: '需求分析', x: 100, y: 50, color: '#3b82f6' },
  { id: 'n2', label: '设计', x: 300, y: 50, color: '#8b5cf6' },
  { id: 'n3', label: '开发', x: 500, y: 50, color: '#22c55e' },
  { id: 'n4', label: '测试', x: 200, y: 200, color: '#f59e0b' },
  { id: 'n5', label: '部署', x: 400, y: 200, color: '#ef4444' },
  { id: 'n6', label: '维护', x: 600, y: 200, color: '#6b7280' },
];

nodes.forEach((n) => {
  graph.addNode({
    id: n.id,
    label: n.label,
    x: n.x,
    y: n.y,
    style: {
      width: 120,
      height: 60,
      backgroundColor: n.color,
      borderColor: n.color,
      textColor: '#ffffff',
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
});

// 创建连接
const edges = [
  { source: 'n1', target: 'n2' },
  { source: 'n2', target: 'n3' },
  { source: 'n2', target: 'n4' },
  { source: 'n3', target: 'n5' },
  { source: 'n4', target: 'n5' },
  { source: 'n5', target: 'n6' },
];

edges.forEach((e, i) => {
  graph.addEdge({
    id: 'edge-' + i,
    source: e.source,
    target: e.target,
    style: { stroke: '#94a3b8', strokeWidth: 2 },
  });
});

console.log('🔍 高分辨率导出示例');
console.log('');
console.log('// 2x 分辨率（适合 Retina 屏幕）');
console.log('const png2x = exportPlugin.toPNG({ scale: 2 });');
console.log('');
console.log('// 3x 分辨率（适合打印）');
console.log('const png3x = exportPlugin.toPNG({ scale: 3 });');
console.log('');
console.log('// 自定义尺寸 + 高分辨率');
console.log('const customExport = exportPlugin.toPNG({');
console.log('  width: 1400,');
console.log('  height: 800,');
console.log('  scale: 2,');
  console.log('  backgroundColor: "#ffffff",');
console.log('});');
console.log('');
console.log('// 下载高分辨率图片');
console.log('exportPlugin.download("flowchart@2x.png", {');
console.log('  format: "png",');
console.log('  scale: 2,');
console.log('});');`;

// 示例 5: 区域导出
const EXAMPLE_5_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建导出插件
const exportPlugin = new Export();
graph.use(exportPlugin);

// 创建多个节点组
// 组 1: 输入处理
graph.addNode({
  id: 'input-1',
  label: '数据输入',
  x: 50,
  y: 80,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
  },
});

graph.addNode({
  id: 'input-2',
  label: '数据验证',
  x: 50,
  y: 180,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
  },
});

// 组 2: 处理逻辑
graph.addNode({
  id: 'proc-1',
  label: '业务处理',
  x: 220,
  y: 80,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    textColor: '#166534',
  },
});

graph.addNode({
  id: 'proc-2',
  label: '规则引擎',
  x: 220,
  y: 180,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    textColor: '#166534',
  },
});

graph.addNode({
  id: 'proc-3',
  label: '计算模块',
  x: 220,
  y: 280,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    textColor: '#166534',
  },
});

// 组 3: 输出
graph.addNode({
  id: 'output-1',
  label: '结果输出',
  x: 400,
  y: 130,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#92400e',
  },
});

graph.addNode({
  id: 'output-2',
  label: '日志记录',
  x: 400,
  y: 230,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#92400e',
  },
});

// 组 4: 存储
graph.addNode({
  id: 'store-1',
  label: '数据库',
  x: 570,
  y: 130,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#fce7f3',
    borderColor: '#ec4899',
    textColor: '#9d174d',
  },
});

graph.addNode({
  id: 'store-2',
  label: '缓存',
  x: 570,
  y: 230,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#fce7f3',
    borderColor: '#ec4899',
    textColor: '#9d174d',
  },
});

// 连接节点
const connections = [
  ['input-1', 'proc-1'],
  ['input-2', 'proc-2'],
  ['proc-1', 'output-1'],
  ['proc-2', 'output-1'],
  ['proc-3', 'output-2'],
  ['output-1', 'store-1'],
  ['output-2', 'store-2'],
];

connections.forEach(([source, target], i) => {
  graph.addEdge({
    id: 'conn-' + i,
    source,
    target,
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
  });
});

console.log('📍 区域导出示例');
console.log('');
console.log('// 获取内容边界框');
console.log('const bounds = exportPlugin.getContentBounds(20);');
console.log('');
console.log('// 导出特定区域');
console.log('const regionImage = exportPlugin.exportRegion(');
console.log('  { x: 200, y: 50, width: 150, height: 300 },');
console.log('  { format: "png", scale: 2 }');
console.log(');');
console.log('');
console.log('// 仅导出处理模块（组 2）');
console.log('const processModule = exportPlugin.exportRegion(');
console.log('  { x: 200, y: 60, width: 140, height: 300 },');
console.log('  { format: "png", backgroundColor: "#ffffff" }');
console.log(');');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础导出', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '多格式导出', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: 'SVG 导出（含样式）', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '高分辨率导出', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '区域导出', code: EXAMPLE_5_CODE },
];

export const ExportExample: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);

  // 导出设置
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'svg'>('png');
  const [exportScale, setExportScale] = useState<number>(1);
  const [exportWidth, setExportWidth] = useState<string>('');
  const [exportHeight, setExportHeight] = useState<string>('');
  const [exportBgColor, setExportBgColor] = useState<string>('');
  const [includeGrid, setIncludeGrid] = useState<boolean>(false);
  const [copyStyles, setCopyStyles] = useState<boolean>(true);
  const [exportPreview, setExportPreview] = useState<string | null>(null);

  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    graphContainerRef.current.innerHTML = '';
    setExportPreview(null);

    try {
      const { Graph } = await import('../core');
      const { Export } = await import('../plugins');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        Export,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Export } = sandbox;
        
        // 存储引用供导出控制面板使用
        let __export_graph = null;
        let __export_plugin = null;
        
        // 包装插件安装方法
        const originalUse = Graph.prototype.use;
        Graph.prototype.use = function(plugin) {
          const result = originalUse.call(this, plugin);
          if (plugin instanceof Export) {
            __export_plugin = plugin;
          }
          return result;
        };
        
        ${codeToExecute}
        
        // 如果创建了 Graph 实例，存储引用
        if (typeof graph !== 'undefined') {
          __export_graph = graph;
          window.__EXPORT_GRAPH__ = graph;
          window.__EXPORT_PLUGIN__ = __export_plugin;
        }
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

  // 执行导出
  const handleExport = useCallback(async () => {
    if (!graphContainerRef.current) return;

    try {
      // 获取 Graph 实例
      const graph = (window as any).__EXPORT_GRAPH__;
      const exportPlugin = (window as any).__EXPORT_PLUGIN__;

      if (!graph || !exportPlugin) {
        alert('请先运行示例代码创建画布');
        return;
      }

      const options: any = {
        format: exportFormat,
        scale: exportScale,
        includeGrid,
      };

      if (exportWidth) options.width = parseInt(exportWidth);
      if (exportHeight) options.height = parseInt(exportHeight);
      if (exportBgColor) options.backgroundColor = exportBgColor;
      if (exportFormat === 'svg') options.copyStyles = copyStyles;

      let result: string;

      if (exportFormat === 'svg') {
        result = exportPlugin.toSVG(options);
        // 创建 SVG Blob URL
        const blob = new Blob([result], { type: 'image/svg+xml' });
        result = URL.createObjectURL(blob);
      } else if (exportFormat === 'jpeg') {
        result = exportPlugin.toJPEG(options);
      } else {
        result = exportPlugin.toPNG(options);
      }

      setExportPreview(result);
    } catch (error) {
      console.error('导出错误:', error);
      alert('导出失败: ' + (error as Error).message);
    }
  }, [exportFormat, exportScale, exportWidth, exportHeight, exportBgColor, includeGrid, copyStyles]);

  // 下载导出
  const handleDownload = useCallback(async () => {
    if (!graphContainerRef.current) return;

    try {
      const exportPlugin = (window as any).__EXPORT_PLUGIN__;

      if (!exportPlugin) {
        alert('请先运行示例代码创建画布');
        return;
      }

      const options: any = {
        format: exportFormat,
        scale: exportScale,
        includeGrid,
      };

      if (exportWidth) options.width = parseInt(exportWidth);
      if (exportHeight) options.height = parseInt(exportHeight);
      if (exportBgColor) options.backgroundColor = exportBgColor;
      if (exportFormat === 'svg') options.copyStyles = copyStyles;

      const filename = `export-${Date.now()}.${exportFormat}`;
      exportPlugin.download(filename, options);
    } catch (error) {
      console.error('下载错误:', error);
      alert('下载失败: ' + (error as Error).message);
    }
  }, [exportFormat, exportScale, exportWidth, exportHeight, exportBgColor, includeGrid, copyStyles]);

  useEffect(() => {
    executeCode(EXAMPLE_1_CODE);
  }, [executeCode]);

  const LeftPanel = (
    <Panel>
      <PanelHeader icon="📤" title="导出演示" hint="配置导出选项并预览效果" />
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
        <div id="export-options-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            导出配置选项
          </h3>
          <Table columns={exportOptionsColumns} dataSource={exportOptionsData} pagination={false} />
        </div>
        <div id="svg-options-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            SVG 导出选项
          </h3>
          <Table columns={svgOptionsColumns} dataSource={svgOptionsData} pagination={false} />
        </div>
        <div id="export-methods-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            导出方法
          </h3>
          <Table columns={exportMethodsColumns} dataSource={exportMethodsData} pagination={false} />
        </div>
        <div id="export-usage-tips">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>使用提示</h3>
          <ul style={{ lineHeight: '1.8', color: '#475569' }}>
            <li><strong>SVG 尺寸：</strong>未设置 width/height 时，默认使用 '100%'</li>
            <li><strong>样式复制：</strong>SVG 导出默认会复制外部样式表中的样式，可通过 copyStyles 控制</li>
            <li><strong>高分辨率：</strong>使用 scale 参数导出高分辨率图片，适合打印或 Retina 屏幕</li>
            <li><strong>格式选择：</strong>PNG 支持透明背景，JPEG 文件更小但不支持透明</li>
            <li><strong>区域导出：</strong>使用 exportRegion 方法导出画布的特定区域</li>
            <li><strong>内容边界：</strong>使用 getContentBounds 获取所有节点的边界框</li>
          </ul>
        </div>
      </div>
    </Panel>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: '600px' }}>
        <PanelHeader title="Export 导出插件示例" />
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

      {/* 导出控制面板 */}
      <div
        style={{
          margin: '16px',
          padding: '16px',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginTop: '115px'
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>
          📤 导出设置
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#64748b' }}>
              格式
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'png' | 'jpeg' | 'svg')}
              style={{ width: '100%', padding: '6px 12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="svg">SVG</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#64748b' }}>
              缩放比例
            </label>
            <select
              value={exportScale}
              onChange={(e) => setExportScale(Number(e.target.value))}
              style={{ width: '100%', padding: '6px 12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={3}>3x</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#64748b' }}>
              宽度 (可选，默认 100%)
            </label>
            <input
              type="text"
              value={exportWidth}
              onChange={(e) => setExportWidth(e.target.value)}
              placeholder="例如: 800"
              style={{ width: '100%', padding: '6px 12px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#64748b' }}>
              高度 (可选，默认 100%)
            </label>
            <input
              type="text"
              value={exportHeight}
              onChange={(e) => setExportHeight(e.target.value)}
              placeholder="例如: 600"
              style={{ width: '100%', padding: '6px 12px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#64748b' }}>
              背景颜色
            </label>
            <input
              type="text"
              value={exportBgColor}
              onChange={(e) => setExportBgColor(e.target.value)}
              placeholder="#ffffff"
              style={{ width: '100%', padding: '6px 12px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeGrid}
              onChange={(e) => setIncludeGrid(e.target.checked)}
            />
            <span style={{ fontSize: '13px', color: '#374151' }}>包含网格</span>
          </label>
          {exportFormat === 'svg' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={copyStyles}
                onChange={(e) => setCopyStyles(e.target.checked)}
              />
              <span style={{ fontSize: '13px', color: '#374151' }}>复制外部样式</span>
            </label>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="primary" onClick={handleExport}>
            预览导出
          </Button>
          <Button onClick={handleDownload}>下载图片</Button>
        </div>
      </div>

      {/* 导出预览 */}
      {exportPreview && (
        <div
          style={{
            margin: '16px',
            padding: '16px',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>
            导出预览
          </h3>
          <div
            style={{
              maxWidth: '100%',
              overflow: 'auto',
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '4px',
            }}
          >
            {exportFormat === 'svg' ? (
              <div dangerouslySetInnerHTML={{ __html: exportPreview.startsWith('blob:') ? '' : exportPreview }} />
            ) : (
              <img
                src={exportPreview}
                alt="导出预览"
                style={{ maxWidth: '100%', height: 'auto', border: '1px solid #e2e8f0' }}
              />
            )}
          </div>
        </div>
      )}

      {BottomPanel}
    </div>
  );
};

export default ExportExample;
