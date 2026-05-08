# Purple Store - TODO

## Base de Datos y Backend
- [x] Esquema: categorías (categories)
- [x] Esquema: productos (products) con imágenes, precio, stock, categoría
- [x] Esquema: pedidos (orders) y líneas de pedido (order_items)
- [x] Esquema: clientes / usuarios con dirección
- [x] Esquema: contenido editable (site_content) para hero, banners, sobre nosotros, FAQs
- [x] Esquema: mensajes de contacto (contact_messages)
- [x] Esquema: carrito (cart_items)
- [x] API tRPC: CRUD categorías
- [x] API tRPC: CRUD productos con upload de imágenes
- [x] API tRPC: gestión de pedidos (listar, actualizar estado)
- [x] API tRPC: gestión de clientes
- [x] API tRPC: contenido editable (hero, banners, sobre nosotros, FAQs)
- [x] API tRPC: carrito de compras
- [x] API tRPC: checkout y creación de pedidos
- [x] API tRPC: mensajes de contacto
- [x] API tRPC: upload de imágenes (S3)

## Diseño Global
- [x] Paleta de colores púrpura + blanco en index.css
- [x] Tipografía elegante (Google Fonts: Playfair Display + Inter)
- [x] Componente Navbar público con carrito
- [x] Componente Footer
- [x] Componente ProductCard
- [x] CartContext con sessionId persistente

## Frontend Público
- [x] Página Home: sección hero editable, productos destacados, categorías destacadas, info tienda
- [x] Página Tienda: listado de productos, filtros por categoría, buscador
- [x] Página Detalle de Producto
- [x] Página Sobre Nosotros: contenido editable desde admin
- [x] Página Contacto: formulario funcional
- [x] Página FAQs: preguntas y respuestas editables desde admin

## Carrito y Checkout
- [x] Sidebar/drawer de carrito de compras
- [x] Página de checkout con formulario de datos del cliente
- [x] Confirmación de pedido

## Panel de Administración
- [x] Layout del panel admin con sidebar
- [x] Dashboard admin con métricas básicas
- [x] Gestión de productos: listar, agregar, editar, eliminar
- [x] Gestión de categorías: listar, agregar, editar, eliminar
- [x] Gestión de pedidos: listar, ver detalle, actualizar estado
- [x] Gestión de clientes: listar, ver detalle
- [x] Editor de contenido: hero, banners, sobre nosotros
- [x] Editor de FAQs: agregar, editar, eliminar preguntas
- [x] Gestión de mensajes de contacto

## Pruebas y Entrega
- [x] Tests vitest para procedimientos principales (10/10 passing)
- [x] Checkpoint final

## Rediseño Visual v2
- [x] Actualizar paleta CSS: púrpura lavanda (#C9B8FF), índigo oscuro (#3D1A8C), blanco puro
- [x] Cambiar tipografía global a Nunito (palo seco redondeada)
- [x] Rediseñar Hero: contenedor con bordes redondeados, no full-width, imagen de fondo con overlay
- [x] Rediseñar Home: estructura organizada tipo cards, secciones para cuadros de anime
- [x] Actualizar Navbar con nueva paleta y tipografía
- [x] Actualizar ProductCard con nueva paleta

## Rediseño Visual v3 - Páginas restantes
- [x] Rediseñar página Tienda con nueva identidad BoraHae
- [x] Rediseñar página Detalle de Producto
- [x] Rediseñar página Sobre Nosotros
- [x] Rediseñar página Contacto
- [x] Rediseñar página FAQs
- [x] Rediseñar Checkout y CartDrawer

## Rediseño Visual v4 - Sidebar lateral
- [x] Crear componente SidebarNav con iconos, logo, links y controles de usuario
- [x] Actualizar StoreLayout para layout con sidebar izquierdo fijo
- [x] Eliminar Navbar horizontal
- [x] Ajustar hero y páginas para que no queden cortadas por el sidebar
