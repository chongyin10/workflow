import React, { useEffect, useRef } from 'react';
import { Graph } from '../core/Graph';
import { Node } from '../core/Node';

/**
 * BlankEventExample - 演示画布空白区域事件的使用
 *
 * 本示例展示了如何使用 blank:click、blank:dblclick、blank:contextmenu、
 * blank:mousedown、blank:mousemove、blank:mouseup、blank:mousewheel 事件
 */
export function BlankEventExample() {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph | null>(null);
    const logsRef = useRef<HTMLDivElement>(null);
    const lastMouseMoveTimeRef = useRef<number>(0);
    const lastMouseMovePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const addLog = (message: string) => {
        if (logsRef.current) {
            const logEntry = document.createElement('div');
            logEntry.style.cssText = `
                padding: 4px 8px;
                margin: 2px 0;
                background: #f3f4f6;
                border-radius: 4px;
                font-size: 12px;
                font-family: monospace;
            `;
            logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
            logsRef.current.insertBefore(logEntry, logsRef.current.firstChild);

            // 只保留最近20条日志
            while (logsRef.current.children.length > 20) {
                logsRef.current.removeChild(logsRef.current.lastChild!);
            }
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // 创建图实例
        const graph = new Graph({
            container: containerRef.current,
            width: 800,
            height: 600,
            draggable: true,
            scalable: true,
            grid: {
                enabled: true,
                size: 20,
                color: '#e5e7eb',
            },
        });

        graphRef.current = graph;

        // 添加一些示例节点
        const node1 = graph.addNode({
            id: 'node1',
            x: 100,
            y: 100,
            label: '节点 1',
            style: {
                width: 120,
                height: 60,
            },
        });

        const node2 = graph.addNode({
            id: 'node2',
            x: 300,
            y: 200,
            label: '节点 2',
            style: {
                width: 120,
                height: 60,
            },
        });

        // 添加 blank 事件监听 - 暂时关闭日志记录以排查性能问题
        // 暂时移除所有事件监听以排查性能问题
        // graph.on('blank:click', (e) => {
        //     console.log('blank:click', e);
        // });
        // graph.on('blank:dblclick', (e) => {
        //     console.log('blank:dblclick', e);
        // });
        // graph.on('blank:contextmenu', (e) => {
        //     console.log('blank:contextmenu', e);
        // });
        // graph.on('blank:mousedown', (e) => {
        //     console.log('blank:mousedown', e);
        // });
        // graph.on('blank:mousemove', (e) => {
        //     console.log('blank:mousemove', e);
        // });
        // graph.on('blank:mouseup', (e) => {
        //     console.log('blank:mouseup', e);
        // });
        // graph.on('blank:mousewheel', (e) => {
        //     console.log('blank:mousewheel', e);
        // });
        // graph.on('node:click', (e) => {
        //     console.log('node:click', e.node.getId());
        // });
        // graph.on('node:mousedown', (e) => {
        //     console.log('node:mousedown', e.node.getId());
        // });

        return () => {
            graph.destroy();
            graphRef.current = null;
        };
    }, []);

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
            <div style={{ flex: 1 }}>
                <h3>画布空白区域事件演示</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                    在画布的空白区域（网格区域）点击、双击、右键、拖动、滚动，查看事件日志。
                    <br />
                    在节点上操作不会触发 blank 事件，会触发 node 事件。
                </p>
                <div
                    ref={containerRef}
                    style={{
                        width: '100%',
                        height: '500px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: '#fafafa',
                    }}
                />
            </div>
            <div style={{ width: '350px' }}>
                <h4>事件日志</h4>
                <div
                    ref={logsRef}
                    style={{
                        height: '520px',
                        overflow: 'auto',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '10px',
                        backgroundColor: '#fff',
                    }}
                >
                    <div style={{ color: '#999', fontSize: '12px' }}>
                        等待事件触发...
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlankEventExample;
