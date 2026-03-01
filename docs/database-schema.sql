-- Golvia Nepal marketplace baseline schema (PostgreSQL)

create table if not exists users (
  id uuid primary key,
  email varchar(255) unique not null,
  password_hash varchar(255) not null,
  first_name varchar(80) not null,
  last_name varchar(80) not null,
  phone varchar(30),
  role varchar(20) not null default 'CUSTOMER',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists seller_profiles (
  id uuid primary key,
  user_id uuid unique not null references users(id) on delete cascade,
  store_name varchar(160) not null,
  store_slug varchar(180) unique not null,
  description text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key,
  name varchar(120) not null,
  slug varchar(140) unique not null,
  parent_id uuid references categories(id) on delete set null
);

create table if not exists brands (
  id uuid primary key,
  name varchar(120) not null,
  slug varchar(140) unique not null
);

create table if not exists products (
  id uuid primary key,
  seller_id uuid not null references users(id) on delete cascade,
  category_id uuid not null references categories(id),
  brand_id uuid references brands(id),
  name varchar(180) not null,
  slug varchar(220) unique not null,
  sku varchar(120) unique not null,
  description text,
  price numeric(12,2) not null,
  compare_at_price numeric(12,2),
  stock_quantity int not null default 0,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_images (
  id uuid primary key,
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  alt_text varchar(255),
  sort_order int not null default 0
);

create table if not exists orders (
  id uuid primary key,
  user_id uuid not null references users(id),
  order_number varchar(40) unique not null,
  status varchar(30) not null default 'PENDING',
  payment_status varchar(30) not null default 'PENDING',
  payment_method varchar(30) not null,
  subtotal numeric(12,2) not null,
  shipping_cost numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key,
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  seller_id uuid not null references users(id),
  quantity int not null,
  unit_price numeric(12,2) not null,
  line_total numeric(12,2) not null
);

create table if not exists reviews (
  id uuid primary key,
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references users(id),
  rating int not null check (rating between 1 and 5),
  title varchar(140),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_featured_created on products(is_featured, created_at desc);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_orders_user_created on orders(user_id, created_at desc);
