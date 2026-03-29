# zjpcy-workflow

> **📖 开发文档**：请参考 [`API_REFERENCE.md`](./API_REFERENCE.md) 获取完整的 API 文档、架构说明和开发指南，方便快速理解和二次开发(可在大模型中直接读取md文件，基本了解方法如何使用)。

> **💡 提示**：若组件在使用中遇到问题，建议从 GitHub 下载源码，直接使用大模型（如 Claude、GPT 等）进行修改和完善。可将 `API_REFERENCE.md` 作为上下文提供给大模型，帮助其快速理解项目架构。

一个基于 React + TypeScript 的可交互画布组件库，支持拖拽、缩放等操作。

## 特性

- 🚀 基于 React 18 + TypeScript
- 🎨 可拖拽、可缩放的画布组件
- 📦 Webpack 开发环境
- 🎯 Rollup 打包发布
- 🔥 Next.js 集成支持
- 🌐 支持坐标转换（屏幕坐标 ↔ 世界坐标）
- 📐 可选网格背景

## 安装

```bash
npm install @zjpcy/workflow
```

## 使用

### 基础用法

```tsx
import { useEffect, useRef } from 'react';
import { Graph } from '@zjpcy/workflow';
import type { Point } from '@zjpcy/workflow';
import '@zjpcy/workflow/dist/esm/index.css';

function App() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const graph = new Graph({
            container: containerRef.current,
            draggable: true,
            scalable: true,
            grid: {
                enabled: true,
                size: 20,
                color: '#e5e7eb',
            },
            onDragEnd: (offset: Point) => {
                console.log('拖拽结束，偏移量:', offset);
            },
            onZoom: (scale: number, offset: Point) => {
                console.log('缩放:', scale, '偏移量:', offset);
            },
        });

        return () => {
            graph.destroy();
        };
    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}
```

### 自定义绘制

```tsx
import { Graph } from '@zjpcy/workflow';

class CustomGraph extends Graph {
    protected onRender(): void {
        const ctx = this.getContext();

        // 绘制自定义内容
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
    }
}
```

### 坐标转换

```tsx
// 屏幕坐标转世界坐标
const worldPoint = graph.screenToWorld({ x: 100, y: 100 });

// 世界坐标转屏幕坐标
const screenPoint = graph.worldToScreen({ x: 50, y: 50 });
```

### 控制方法

```tsx
// 重置画布
graph.reset();

// 缩放到指定比例
graph.zoomTo(1.5);

// 平移到指定位置
graph.panTo({ x: 0, y: 0 });

// 适应内容到视图
graph.fitToContent({ x: 0, y: 0, width: 500, height: 300 }, 50);

// 获取当前变换状态
const { scale, offset } = graph.getTransform();
```

## 开发

### Webpack 开发环境

```bash
npm run dev
```

访问 http://localhost:3000

### Next.js 开发环境

```bash
npm run dev:next
```

访问 http://localhost:3000

## 构建发布

```bash
npm run build:lib
```

构建后的文件在 `dist/` 目录下。

## 发布到 npm

```bash
npm publish
```

## API

### Graph

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| container | HTMLElement | 必填 | 画布容器元素 |
| width | number | 800 | 画布宽度 |
| height | number | 600 | 画布高度 |
| draggable | boolean | true | 是否启用拖拽 |
| scalable | boolean | true | 是否启用缩放 |
| minZoom | number | 0.1 | 最小缩放比例 |
| maxZoom | number | 5 | 最大缩放比例 |
| initialOffsetX | number | 0 | 初始 X 偏移 |
| initialOffsetY | number | 0 | 初始 Y 偏移 |
| backgroundColor | string | '#ffffff' | 背景颜色 |
| grid | { enabled, size, color } | { enabled: true, size: 20, color: '#e5e7eb' } | 网格配置 |
| onDragEnd | (offset: Point) => void | - | 拖拽结束回调 |
| onZoom | (scale: number, offset: Point) => void | - | 缩放回调 |

### 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| getCanvas | - | HTMLCanvasElement | 获取画布元素 |
| getContext | - | CanvasRenderingContext2D | 获取 2D 上下文 |
| getContainer | - | HTMLElement | 获取容器元素 |
| getTransform | - | { scale, offset } | 获取当前变换状态 |
| reset | - | void | 重置画布状态 |
| zoomTo | scale: number | void | 缩放到指定比例 |
| panTo | offset: Point | void | 平移到指定位置 |
| screenToWorld | point: Point | Point | 屏幕坐标转世界坐标 |
| worldToScreen | point: Point | Point | 世界坐标转屏幕坐标 |
| fitToContent | bounds: Bounds, padding?: number | void | 适应内容到视图 |
| destroy | - | void | 销毁实例，清理事件监听 |

### 类型

```typescript
interface Point {
    x: number;
    y: number;
}

interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}
```

## 示例

项目包含完整的示例代码，位于 `src/app/Graph.example.ts`：

- 基础用法示例
- 自定义 Graph 类
- 带控制的画布
- 坐标转换示例
- 适应内容示例

## License

MIT
