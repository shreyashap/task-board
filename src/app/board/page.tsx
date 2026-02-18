'use client';

import { BoardLayout } from '@/components/layout/BoardLayout';
import { BoardView } from '@/components/board/BoardView';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function BoardPage() {
    return (
        <ProtectedRoute>
            <BoardLayout>
                <BoardView />
            </BoardLayout>
        </ProtectedRoute>
    );
}
