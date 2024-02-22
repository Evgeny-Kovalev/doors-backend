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

	@OneToMany(() => AttributeValue, (attribute) => attribute.value)
	values: AttributeValue[];
}

@Entity()
export class AttributeValue {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToMany(() => ProductVariant, (variant) => variant.attributes)
	variants: ProductVariant[];

	@ManyToOne(() => Attribute, (attribute) => attribute.values)
	attribute: Attribute;

	@Column()
	value: string;
}
