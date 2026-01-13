"""create_tasks_table

Revision ID: 001
Revises:
Create Date: 2026-01-04 01:00:00

Creates the tasks table with:
- Auto-incrementing primary key
- Foreign key to users.id
- Indexes for performance
- Constraints for data integrity
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Create tasks table with indexes and constraints.

    Table Structure:
    - id: SERIAL PRIMARY KEY (auto-incrementing)
    - user_id: TEXT NOT NULL (foreign key to users.id)
    - title: VARCHAR(200) NOT NULL
    - description: TEXT (nullable)
    - completed: BOOLEAN NOT NULL DEFAULT FALSE
    - created_at: TIMESTAMP NOT NULL DEFAULT NOW()
    - updated_at: TIMESTAMP NOT NULL DEFAULT NOW()

    Indexes:
    - idx_tasks_user_id: On user_id for fast user filtering
    - idx_tasks_user_completed: On (user_id, completed) for status filtering
    - idx_tasks_user_created: On (user_id, created_at DESC) for sorting

    Constraints:
    - Foreign key: user_id → users.id (CASCADE on delete/update)
    - NOT NULL: user_id, title, completed, created_at, updated_at
    - DEFAULT: completed = FALSE, timestamps = NOW()
    """
    op.create_table(
        'tasks',
        # Primary key
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),

        # Foreign key to users
        sa.Column('user_id', sa.Text(), nullable=False),

        # Task content
        sa.Column('title', sa.VARCHAR(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),

        # Status
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),

        # Timestamps
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),

        # Foreign key constraint
        sa.ForeignKeyConstraint(
            ['user_id'],
            ['users.id'],
            name='fk_tasks_user_id',
            ondelete='CASCADE',
            onupdate='CASCADE'
        ),
    )

    # Create indexes for performance

    # Index on user_id (most common filter)
    op.create_index(
        'idx_tasks_user_id',
        'tasks',
        ['user_id']
    )

    # Composite index on user_id + completed (for filtering by status)
    op.create_index(
        'idx_tasks_user_completed',
        'tasks',
        ['user_id', 'completed']
    )

    # Composite index on user_id + created_at DESC (for sorting)
    op.create_index(
        'idx_tasks_user_created',
        'tasks',
        ['user_id', sa.text('created_at DESC')]
    )


def downgrade() -> None:
    """
    Drop tasks table and all indexes.

    Order matters: Drop indexes first, then table.
    """
    # Drop indexes
    op.drop_index('idx_tasks_user_created', table_name='tasks')
    op.drop_index('idx_tasks_user_completed', table_name='tasks')
    op.drop_index('idx_tasks_user_id', table_name='tasks')

    # Drop table (cascade will handle foreign key)
    op.drop_table('tasks')
