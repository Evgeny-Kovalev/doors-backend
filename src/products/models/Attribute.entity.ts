import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
	ManyToMany,
} from 'typeorm';
import { ProductVariant } from './ProductVariant.entity';

@Entity()
export class Attribute {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	value: string;

	@ManyToMany(() => ProductVariant, (variant) => variant.attributes)
	variants: ProductVariant[];
}
