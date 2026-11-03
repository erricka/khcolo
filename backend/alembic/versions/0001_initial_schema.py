"""initial schema

Revision ID: 0001
Revises: 
Create Date: 2026-11-03 03:21:11.038037
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = '0001'
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('inquiries',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('name', sa.String(length=120), nullable=False),
    sa.Column('company', sa.String(length=160), nullable=True),
    sa.Column('email', sa.String(length=254), nullable=True),
    sa.Column('phone', sa.String(length=40), nullable=True),
    sa.Column('preferred_contact', sa.String(length=20), nullable=True),
    sa.Column('request_type', sa.String(length=20), nullable=False),
    sa.Column('interest', sa.String(length=120), nullable=False),
    sa.Column('product_slug', sa.String(length=160), nullable=True),
    sa.Column('message', sa.Text(), nullable=False),
    sa.Column('consent', sa.Boolean(), nullable=False),
    sa.Column('source_path', sa.String(length=300), nullable=True),
    sa.Column('ip_hash', sa.String(length=64), nullable=False),
    sa.Column('user_agent', sa.String(length=300), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('notification_status', sa.String(length=20), nullable=False),
    sa.Column('notified_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_inquiries_created_at'), 'inquiries', ['created_at'], unique=False)
    op.create_index(op.f('ix_inquiries_ip_hash'), 'inquiries', ['ip_hash'], unique=False)
    op.create_table('media',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('src', sa.String(length=500), nullable=False),
    sa.Column('alt', sa.String(length=300), nullable=False),
    sa.Column('width', sa.Integer(), nullable=False),
    sa.Column('height', sa.Integer(), nullable=False),
    sa.Column('source_url', sa.String(length=500), nullable=True),
    sa.Column('rights_status', sa.String(length=20), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('src')
    )
    op.create_table('page_seo',
    sa.Column('path', sa.String(length=300), nullable=False),
    sa.Column('title', sa.String(length=120), nullable=False),
    sa.Column('description', sa.String(length=320), nullable=False),
    sa.Column('h1', sa.String(length=200), nullable=False),
    sa.Column('schema_type', sa.String(length=80), nullable=False),
    sa.Column('indexable', sa.Boolean(), nullable=False),
    sa.Column('source_url', sa.String(length=500), nullable=True),
    sa.Column('content_updated_on', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False),
    sa.PrimaryKeyConstraint('path')
    )
    op.create_table('product_categories',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('slug', sa.String(length=120), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=120), nullable=False),
    sa.Column('singular', sa.String(length=120), nullable=False),
    sa.Column('h1', sa.String(length=200), nullable=False),
    sa.Column('summary', sa.Text(), nullable=False),
    sa.Column('intro', sa.Text(), nullable=False),
    sa.Column('facet_label', sa.String(length=60), nullable=False),
    sa.Column('seo_title', sa.String(length=120), nullable=False),
    sa.Column('seo_description', sa.String(length=320), nullable=False),
    sa.Column('related_services', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('source_url', sa.String(length=500), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('content_updated_on', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False),
    sa.Column('review_status', sa.String(length=20), nullable=False),
    sa.Column('review_notes', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('is_published', sa.Boolean(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_product_categories_slug'), 'product_categories', ['slug'], unique=True)
    op.create_table('redirects',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('source', sa.String(length=300), nullable=False),
    sa.Column('destination', sa.String(length=300), nullable=True),
    sa.Column('status_code', sa.Integer(), nullable=False),
    sa.Column('note', sa.Text(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('source')
    )
    op.create_table('services',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('slug', sa.String(length=120), nullable=False),
    sa.Column('group_key', sa.String(length=40), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=160), nullable=False),
    sa.Column('short_name', sa.String(length=80), nullable=False),
    sa.Column('icon', sa.String(length=40), nullable=False),
    sa.Column('summary', sa.Text(), nullable=False),
    sa.Column('h1', sa.String(length=200), nullable=False),
    sa.Column('intro', sa.Text(), nullable=False),
    sa.Column('seo_title', sa.String(length=120), nullable=False),
    sa.Column('seo_description', sa.String(length=320), nullable=False),
    sa.Column('body', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('source_url', sa.String(length=500), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('content_updated_on', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False),
    sa.Column('review_status', sa.String(length=20), nullable=False),
    sa.Column('review_notes', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('is_published', sa.Boolean(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_services_slug'), 'services', ['slug'], unique=True)
    op.create_table('site_settings',
    sa.Column('key', sa.String(length=64), nullable=False),
    sa.Column('value', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('review_status', sa.String(length=20), nullable=False),
    sa.Column('review_notes', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('key')
    )
    op.create_table('products',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('slug', sa.String(length=160), nullable=False),
    sa.Column('category_id', sa.Integer(), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('brand', sa.String(length=80), nullable=True),
    sa.Column('series', sa.String(length=80), nullable=True),
    sa.Column('model', sa.String(length=120), nullable=False),
    sa.Column('name', sa.String(length=200), nullable=False),
    sa.Column('variant', sa.String(length=200), nullable=True),
    sa.Column('product_type', sa.String(length=160), nullable=False),
    sa.Column('facet', sa.String(length=60), nullable=False),
    sa.Column('summary', sa.Text(), nullable=False),
    sa.Column('key_specs', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('accessories', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('public_notes', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('seo_title', sa.String(length=120), nullable=False),
    sa.Column('seo_description', sa.String(length=320), nullable=False),
    sa.Column('source_urls', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('image_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('content_updated_on', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False),
    sa.Column('review_status', sa.String(length=20), nullable=False),
    sa.Column('review_notes', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('is_published', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['category_id'], ['product_categories.id'], ondelete='RESTRICT'),
    sa.ForeignKeyConstraint(['image_id'], ['media.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_products_category_id'), 'products', ['category_id'], unique=False)
    op.create_index(op.f('ix_products_slug'), 'products', ['slug'], unique=True)
    op.create_table('product_specs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('label', sa.String(length=120), nullable=False),
    sa.Column('value', sa.String(length=400), nullable=False),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('product_id', 'position')
    )
    op.create_index(op.f('ix_product_specs_product_id'), 'product_specs', ['product_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_product_specs_product_id'), table_name='product_specs')
    op.drop_table('product_specs')
    op.drop_index(op.f('ix_products_slug'), table_name='products')
    op.drop_index(op.f('ix_products_category_id'), table_name='products')
    op.drop_table('products')
    op.drop_table('site_settings')
    op.drop_index(op.f('ix_services_slug'), table_name='services')
    op.drop_table('services')
    op.drop_table('redirects')
    op.drop_index(op.f('ix_product_categories_slug'), table_name='product_categories')
    op.drop_table('product_categories')
    op.drop_table('page_seo')
    op.drop_table('media')
    op.drop_index(op.f('ix_inquiries_ip_hash'), table_name='inquiries')
    op.drop_index(op.f('ix_inquiries_created_at'), table_name='inquiries')
    op.drop_table('inquiries')
