import { BarChart, Card, Dropdown, decimalPlaces, Text, Popover } from 'phantom-library';
import { useState } from 'react';
import style from './SumgramsCard.module.scss';

interface SumgramsCardProps {
    title: string;
    subtitle?: string;
    sumgrams: Sumgrams[];
}

const HighlightedText = ({ text, match }: { text: string; match: string }) => {
    if (!match) return <span>{text}</span>;

    // Escape special characters in the match string for use in a regular expression
    const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedMatch})`, 'gi');

    const parts = text.split(regex);

    return <span>{parts.map((part, index) => (part.toLowerCase() === match.toLowerCase() ? <mark key={index}>{part}</mark> : part))}</span>;
};

const SumgramsCard: React.FC<SumgramsCardProps> = ({ title, subtitle, sumgrams }) => {
    // To-do: filter out sumgrams where there are no top sumgrams
    const sumgramOptions = sumgrams.map((sumgram: Sumgrams, index: number) => {
        return {
            label: `ngram = ${sumgram.base_ngram}`,
            value: index
        };
    });

    const defaultSumgram = sumgramOptions.length > 1 ? 1 : 0;
    const [sumgramIndex, setSumgramIndex] = useState<number>(defaultSumgram);

    return (
        <Card fullHeight>
            <Card.Header title={title} subtitle={subtitle} Icon={BarChart} />
            <Card.Body scrollable>
                {sumgramOptions.length > 0 ? (
                    <>
                        <Dropdown
                            options={sumgramOptions}
                            onChange={(selected) => setSumgramIndex(typeof selected == 'number' ? selected : 1)}
                            placeholder="Select ngram"
                            defaultValue={sumgramOptions[defaultSumgram].value}
                        />
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>Rank</th>
                                    <th>sumgram</th>
                                    <th style={{ width: '100px' }}>Frequency</th>
                                    <th style={{ width: '85px' }}>Rate (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sumgrams[sumgramIndex].top_sumgrams.map((sumgram: Sumgram, index: number) => {
                                    console.log(sumgram);
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}.</td>

                                            {sumgram.parent_sentences.length > 0 ? (
                                                <Popover
                                                    customStyle={style.popover}
                                                    content={
                                                        <div className={style.content}>
                                                            {sumgram.parent_sentences.map((sentence) => {
                                                                return (
                                                                    <>
                                                                        <HighlightedText text={sentence.sentence} match={sumgram.ngram} />
                                                                        <br />
                                                                        <br />
                                                                    </>
                                                                );
                                                            })}
                                                        </div>
                                                    }
                                                    direction="right"
                                                >
                                                    <td>{sumgram.ngram}</td>
                                                </Popover>
                                            ) : (
                                                <Popover content="No sentences found" direction="right">
                                                    <td>{sumgram.ngram}</td>
                                                </Popover>
                                            )}

                                            <td>{sumgram.term_freq}</td>
                                            <td>{decimalPlaces(sumgram.term_rate * 100, 1)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <Text>Unable to calculate sumgrams for this account.</Text>
                )}
            </Card.Body>
        </Card>
    );
};

export { SumgramsCard };
