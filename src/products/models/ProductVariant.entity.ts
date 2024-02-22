import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { Product } from './Product.entity';
import { AttributeValue } from './Attribute.entity';

@Entity()
export class ProductVariant {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	imgPath: string;

	@Column()
	price: number;

	@Column({ nullable: true })
	discountPrice: number;

	@ManyToOne(() => Product, (product) => product.variants)
	product: Product;

	@ManyToMany(() => AttributeValue, (attribute) => attribute.variants)
	@JoinTable()
	attributes: AttributeValue[];
}
