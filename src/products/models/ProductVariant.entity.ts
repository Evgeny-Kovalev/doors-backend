import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { Product } from './Product.entity';
import { Attribute } from './Attribute.entity';

@Entity()
export class ProductVariant {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	imgPath: string;

	@Column({ nullable: true })
	price: number;

	@Column({ nullable: true })
	discountPrice: number;

	@ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
	product: Product;

	@ManyToMany(() => Attribute, (attribute) => attribute.variants)
	@JoinTable()
	attributes: Attribute[];
}
