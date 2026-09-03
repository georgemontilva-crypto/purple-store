CREATE TABLE `newsletter_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255),
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `welcome_popup` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL DEFAULT '¡Bienvenidos a Guaiqui Avenue!',
	`subtitle` varchar(500),
	`body` text,
	`imageUrl` varchar(1000),
	`buttonText` varchar(100) DEFAULT 'Explorar tienda',
	`buttonUrl` varchar(500) DEFAULT '/tienda',
	`showNewsletter` boolean NOT NULL DEFAULT true,
	`active` boolean NOT NULL DEFAULT true,
	`delaySeconds` int DEFAULT 2,
	`showOnce` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `welcome_popup_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlist_id` PRIMARY KEY(`id`)
);
