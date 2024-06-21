import { Card, Grid, GridItemSize, GroupFilled, formatNumber, Hub } from '@imacdonald/phantom';
import { GridViewCard, GroupChangeCard, TopWordsCard, TopWordsCategoryCard } from '../components/cards';
import { Link } from 'react-router-dom';

interface GroupAnalysisProps {
	accounts: AccountBloc[];
	totalTweets: number;
	topBlocWords: Top[];
	topTimes: Top[];
	pairwiseSim: PairwiseSimilarity[];
}

const GroupAnalysis: React.FC<GroupAnalysisProps> = ({ accounts, totalTweets, topBlocWords, topTimes, pairwiseSim }) => {
	return (
		<Grid>
			<Grid.Item size={GridItemSize.Full}>
				<Card>
					<Card.Header title="Accounts Overview" Icon={GroupFilled} />
					<Card.Body>
						<h2>{accounts.map((account: AccountBloc) => `@${account.account_username}`).join(', ')}</h2>
						<p>
							Results for{' '}
							{accounts.map((account: AccountBloc, index: number) => (
								<span key={index}>
									@{account.account_username} <Link to={`www.twitter.com/${account.account_username}`}><i>({account.account_name})</i></Link>,{' '}
								</span>
							))}
							generated using {formatNumber(totalTweets)} tweets.
						</p>
					</Card.Body>
				</Card>
			</Grid.Item>
			<Grid.Item size={GridItemSize.Wide}>
				<TopWordsCard title="Top 100 Behaviors" subtitle="Most dominant action & content behaviors." top={topBlocWords} />
			</Grid.Item>
			<Grid.Item size={GridItemSize.Wide}>
				<TopWordsCategoryCard title="Top Pauses" subtitle="Most frequent pauses between actions." top={topTimes} symbolLabel="Pause" />
			</Grid.Item>
			<Grid.Item size={GridItemSize.Wide}>
				<Card>
					<Card.Header title="Pairwise Similarity" Icon={Hub} />
					<Card.Body>
						<table>
							<thead>
								<tr>
									<th>Similarity</th>
									<th>Account 1</th>
									<th>Account 2</th>
								</tr>
							</thead>
							<tbody>
								{pairwiseSim.map((u_pair: PairwiseSimilarity, index: number) => {
									return (
										<tr key={index}>
											<td>{`${+(u_pair.sim * 100).toFixed(1)}%`}</td>
											<td>{u_pair.user_pair[0]}</td>
											<td>{u_pair.user_pair[1]}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</Card.Body>
				</Card>
			</Grid.Item>
			<Grid.Item size={GridItemSize.Full}>
				<GroupChangeCard title="Comparative Change Between Accounts" reports={accounts} />
			</Grid.Item>
			{accounts.map((account: AccountBloc) => (
				<Grid.Item size={GridItemSize.Full}>
					<GridViewCard title={`Grid View for @${account.account_username}`}  username={account.account_username} data={account.linked_data} />
				</Grid.Item>
			))}
		</Grid>
	);
};

export { GroupAnalysis };
