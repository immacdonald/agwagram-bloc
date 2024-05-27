import { Card, Pause } from '@imacdonald/phantom';
import { DefinitionTooltip, SymbolTooltip } from '../BLOCComponents';

interface TopWordsCategoryCardProps {
	title: string;
	subtitle?: string;
	top: any;
	symbolLabel: string;
}

const TopWordsCategoryCard: React.FC<TopWordsCategoryCardProps> = ({ title, subtitle, top, symbolLabel }: TopWordsCategoryCardProps) => {
	return (
		<Card fullHeight>
			<Card.Header title={title} subtitle={subtitle} Icon={Pause} />
			<Card.Body scrollable>
				<table>
					<thead>
						<tr>
							<th style={{ width: '60px' }}>{symbolLabel}</th>
							<th style={{ width: '90px' }}>Frequency</th>
							<th style={{ width: '85px' }}>Rate (%)</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						{top.map((word: any, i: number) => {
							return (
								<tr key={i}>
									<td>
										<DefinitionTooltip word={word.term} />
									</td>
									<td>{word.term_freq}</td>
									<td>{word.term_rate}</td>
									<td style={{ textAlign: 'left' }}>
										<SymbolTooltip word={word.term} />
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</Card.Body>
		</Card>
	);
};

export default TopWordsCategoryCard;
