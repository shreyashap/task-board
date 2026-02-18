'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addTask, updateTask, Task, Priority, Column } from '@/store/taskSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High']),
    dueDate: z.string().optional(),
    tags: z.array(z.string()),
    column: z.enum(['Todo', 'Doing', 'Done']),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: Task;
    defaultColumn?: Column;
}

export function TaskModal({ isOpen, onClose, task, defaultColumn = 'Todo' }: TaskModalProps) {
    const dispatch = useDispatch();
    const [tagInput, setTagInput] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'Medium',
            dueDate: '',
            tags: [],
            column: defaultColumn,
        },
    });

    const currentTags = watch('tags');

    useEffect(() => {
        if (task) {
            reset({
                title: task.title,
                description: task.description,
                priority: task.priority,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                tags: task.tags,
                column: task.column,
            });
        } else {
            reset({
                title: '',
                description: '',
                priority: 'Medium',
                dueDate: '',
                tags: [],
                column: defaultColumn,
            });
        }
    }, [task, reset, defaultColumn]);

    const onSubmit = (data: TaskFormValues) => {
        if (task) {
            dispatch(updateTask({ id: task.id, updates: data }));
        } else {
            dispatch(addTask(data));
        }
        onClose();
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!currentTags.includes(tagInput.trim())) {
                setValue('tags', [...currentTags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setValue('tags', currentTags.filter(t => t !== tagToRemove));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {task ? 'Edit Task' : 'Create New Task'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            placeholder="Enter task title"
                            {...register('title')}
                            className={errors.title ? 'border-destructive' : ''}
                        />
                        {errors.title && (
                            <p className="text-xs text-destructive">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="What needs to be done?"
                            className="resize-none min-h-[100px]"
                            {...register('description')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                                value={watch('priority')}
                                onValueChange={(val: Priority) => setValue('priority', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input
                                type="date"
                                {...register('dueDate')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-md bg-muted/30 min-h-[40px]">
                            {currentTags.length === 0 && (
                                <span className="text-xs text-muted-foreground italic">No tags added</span>
                            )}
                            {currentTags.map(tag => (
                                <Badge key={tag} className="gap-1 px-1.5 py-0.5">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)}>
                                        <X size={12} className="hover:text-destructive" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <Input
                            placeholder="Type tag and press Enter"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Column</Label>
                        <Select
                            value={watch('column')}
                            onValueChange={(val: Column) => setValue('column', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Todo">Todo</SelectItem>
                                <SelectItem value="Doing">Doing</SelectItem>
                                <SelectItem value="Done">Done</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {task ? 'Save Changes' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
