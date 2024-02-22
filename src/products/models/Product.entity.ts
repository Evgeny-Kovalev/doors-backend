import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductVariant } from './ProductVariant.entity';

@Entity()
export class Product {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	imgPath: string;

	@Column()
	description: string;

	@Column({ default: true })
	isVisible: boolean;

	@OneToMany(() => ProductVariant, (variant) => variant.product)
	variants: ProductVariant[];
}
