'use client';

import { ReactNode, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/authSlice';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    LogOut,
    Search,
    Bell,
    Menu,
    X,
    History,
    Trash2,
    Filter,
    ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    setSearchQuery,
    setFilterPriority,
    setSortBy,
    resetBoard,
    Priority
} from '@/store/taskSlice';
import { formatDistanceToNow } from 'date-fns';
import { Label } from '../ui/label';

interface BoardLayoutProps {
    children: ReactNode;
}

export function BoardLayout({ children }: BoardLayoutProps) {
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);
    const { logs, searchQuery, filterPriority, sortBy } = useSelector((state: RootState) => state.tasks);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/login');
    };

    const handleResetBoard = () => {
        if (confirm('Are you sure you want to reset the board? This will delete all tasks and logs.')) {
            dispatch(resetBoard());
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col">
            {/* Topbar */}
            <header className="h-16 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-40 backdrop-blur-sm bg-background/80">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <Menu size={20} />
                    </Button>
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <LayoutDashboard className="text-primary" />
                        <span className="hidden sm:inline">TaskMaster</span>
                    </div>
                </div>

                <div className="flex-1 max-w-md mx-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-10 h-9 bg-muted/50 focus-visible:bg-background"
                            value={searchQuery}
                            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onClick={() => setShowLogs(!showLogs)}
                    >
                        <History size={20} />
                        {logs.length > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                                {logs.length > 9 ? '9+' : logs.length}
                            </Badge>
                        )}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                                {user?.email[0].toUpperCase()}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">Internal Demo</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleResetBoard} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Reset Board</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar (Desktop Control Panel) */}
                <aside className={`
          fixed lg:static inset-y-0 left-0 w-64 border-r bg-background z-50 transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
                    <div className="h-full flex flex-col p-4 gap-6">
                        <div className="flex items-center justify-between lg:hidden">
                            <span className="font-bold text-lg">Menu</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                                <X size={20} />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider px-2">Filters</Label>
                                <div className="grid grid-cols-1 gap-1">
                                    {(['All', 'High', 'Medium', 'Low'] as const).map((p) => (
                                        <Button
                                            key={p}
                                            variant={filterPriority === p ? 'secondary' : 'ghost'}
                                            className="justify-start h-9"
                                            onClick={() => dispatch(setFilterPriority(p))}
                                        >
                                            <Filter className="mr-2 h-4 w-4" />
                                            {p} Priority
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider px-2">Sort By</Label>
                                <div className="grid grid-cols-1 gap-1">
                                    <Button
                                        variant={sortBy === 'due-date' ? 'secondary' : 'ghost'}
                                        className="justify-start h-9"
                                        onClick={() => dispatch(setSortBy('due-date'))}
                                    >
                                        <ArrowUpDown className="mr-2 h-4 w-4" />
                                        Due Date
                                    </Button>
                                    <Button
                                        variant={sortBy === 'created-at' ? 'secondary' : 'ghost'}
                                        className="justify-start h-9"
                                        onClick={() => dispatch(setSortBy('created-at'))}
                                    >
                                        <ArrowUpDown className="mr-2 h-4 w-4" />
                                        Created At
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/20">
                            <p className="text-xs text-muted-foreground text-center">
                                Built for Internship Assessment 🚀
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>

                {/* Activity Log Overlay */}
                {showLogs && (
                    <aside className="fixed right-0 top-16 bottom-0 w-80 bg-background border-l shadow-xl z-30 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                            <h3 className="font-semibold flex items-center gap-2">
                                <History size={18} />
                                Activity Log
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowLogs(false)}>
                                <X size={18} />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 space-y-4">
                            {logs.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground text-sm italic">
                                    No actions tracked yet.
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <div key={log.id} className="relative pl-4 border-l-2 border-primary/20 py-1">
                                        <div className="absolute left-[-5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                                        <p className="text-sm">
                                            <span className="font-medium text-primary">Task {log.action}</span>: {log.taskTitle}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
