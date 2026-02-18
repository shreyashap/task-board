'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { moveTask, Task, Column } from '@/store/taskSlice';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { Button } from '@/components/ui/button';
import { Plus, ListTodo, Play, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

export function BoardView() {
    const dispatch = useDispatch();
    const { tasks, searchQuery, filterPriority, sortBy } = useSelector((state: RootState) => state.tasks);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [defaultColumn, setDefaultColumn] = useState<Column>('Todo');

    const columns: Column[] = ['Todo', 'Doing', 'Done'];

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
        return matchesSearch && matchesPriority;
    }).sort((a, b) => {
        if (sortBy === 'due-date') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        dispatch(moveTask({ id: draggableId, column: destination.droppableId as Column }));
    };

    const handleCreateTask = (column: Column) => {
        setDefaultColumn(column);
        setEditingTask(undefined);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const columnIcons = {
        Todo: <ListTodo size={18} className="text-blue-500" />,
        Doing: <Play size={18} className="text-yellow-500" />,
        Done: <CheckCircle size={18} className="text-green-500" />,
    };

    return (
        <div className="h-full">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
                    {columns.map((columnId) => {
                        const columnTasks = filteredTasks.filter((t) => t.column === columnId);

                        return (
                            <div key={columnId} className="flex flex-col h-full min-w-[300px]">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <div className="flex items-center gap-2">
                                        {columnIcons[columnId]}
                                        <h2 className="font-bold text-lg">{columnId}</h2>
                                        <Badge variant="secondary" className="ml-2 px-1.5 h-5 flex items-center justify-center min-w-[20px] text-[10px]">
                                            {columnTasks.length}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                        onClick={() => handleCreateTask(columnId)}
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </div>

                                <Droppable droppableId={columnId}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`
                        flex-1 min-h-[500px] rounded-xl p-2 transition-colors duration-200 border-2 border-dashed
                        ${snapshot.isDraggingOver ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-transparent'}
                      `}
                                        >
                                            {columnTasks.map((task, index) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    index={index}
                                                    onEdit={handleEditTask}
                                                />
                                            ))}
                                            {provided.placeholder}
                                            {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                                                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground/40 border-2 border-dashed border-muted-foreground/10 rounded-lg">
                                                    <Plus size={24} className="mb-2 opacity-20" />
                                                    <p className="text-xs italic">Drop or create tasks here</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={editingTask}
                defaultColumn={defaultColumn}
            />
        </div>
    );
}
