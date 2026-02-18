'use client';

import { Task, moveTask, deleteTask } from '@/store/taskSlice';
import { useDispatch } from 'react-redux';
import {
    Calendar,
    Clock,
    MoreVertical,
    Pencil,
    Trash2,
    CheckCircle2,
    Circle,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Draggable } from '@hello-pangea/dnd';

interface TaskCardProps {
    task: Task;
    index: number;
    onEdit: (task: Task) => void;
}

export function TaskCard({ task, index, onEdit }: TaskCardProps) {
    const dispatch = useDispatch();

    const priorityColors = {
        Low: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200',
        Medium: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200',
        High: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200',
    };

    const priorityIcons = {
        Low: <Circle size={14} />,
        Medium: <AlertCircle size={14} />,
        High: <AlertCircle size={14} className="fill-current" />,
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.column !== 'Done';

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-3 last:mb-0"
                >
                    <Card className="shadow-sm hover:shadow-md transition-shadow group border-l-4 border-l-primary/50">
                        <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
                            <Badge variant="outline" className={`${priorityColors[task.priority]} border font-semibold flex items-center gap-1.5`}>
                                {priorityIcons[task.priority]}
                                {task.priority}
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical size={16} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(task)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => dispatch(deleteTask(task.id))}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <CardTitle className="text-sm font-bold line-clamp-1 mb-1">{task.title}</CardTitle>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                {task.description || 'No description'}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {task.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1.5">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="p-3 pt-0 flex items-center justify-between">
                            <div className={`flex items-center gap-1.5 text-[10px] font-medium ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                <Calendar size={12} />
                                {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <Clock size={12} />
                                {format(new Date(task.createdAt), 'h:mm a')}
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </Draggable>
    );
}
