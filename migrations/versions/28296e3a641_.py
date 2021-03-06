"""empty message

Revision ID: 28296e3a641
Revises: 43bdec0aeb4
Create Date: 2015-09-02 11:32:20.319641

"""

# revision identifiers, used by Alembic.
revision = '28296e3a641'
down_revision = '43bdec0aeb4'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('department_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'users', 'departments', ['department_id'], ['id'])
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'users', type_='foreignkey')
    op.drop_column('users', 'department_id')
    ### end Alembic commands ###
