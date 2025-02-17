import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import {
    Button,
    DatasetIcon,
    designTokens,
    Dropdown,
    formatNumericDate,
    formatReadableDate,
    Popover,
    RecenterIcon,
    Row,
    Switch,
    Typography,
    useResponsiveContext,
    ZoomInIcon,
    ZoomOutIcon
} from 'phantom-library';
import { Card } from '@components';
import { useGetSymbolsQuery } from '@data/apiSlice';
import style from './GridViewCard.module.scss';

interface GridViewCardProps {
    title: string;
    username: string;
    data: LinkedData[];
}

interface GridLinkedData extends LinkedData {
    content: string;
}

type GridItemData = GridLinkedData | string;

type LegendKey = Record<string, string>;

// New color palette
/*const actionLegend: LegendKey = {
    //P: '#84f460',
    p: '#5fcecf',
    //R: '#FFA500',
    r: '#416ee8',
    T: '#588e36',
    π: '#e6336f',
    ρ: '#f9da78'
};*/

const actionLegend: LegendKey = {
    //P: '#84f460',
    p: '#5fcecf',
    //R: '#FFA500',
    r: '#ea3323',
    T: '#48752c',
    π: '#ea33f7',
    ρ: '#f9da78'
};

const contentLegend: LegendKey = {
    E: '#5fcecf',
    H: '#ea3323',
    m: '#84f460',
    U: '#ea33f7',
    t: '#f9da78',
    q: '#48752c'
};

/*const pauseLegend: LegendKey = {
    '□': '#ffffff',
    '⚀': '#b7b7b7',
    '⚁': '#b7b7b7',
    '⚂': '#8a8a8a',
    '⚃': '#8a8a8a',
    '⚄': '#636363',
    '⚅': '#636363'
};*/

// Updated blue-grey color palette to fit with enabling symbols
const pauseLegend: LegendKey = {
    '□': '#cbcadd',
    '⚀': '#a8a8bc',
    '⚁': '#87879b',
    '⚂': '#67687c',
    '⚃': '#484a5f',
    '⚄': '#2b2e42',
    '⚅': '#101528'
};

const GridViewCard: React.FC<GridViewCardProps> = ({ title, username, data }) => {
    const { actionLinkedData, contentLinkedData } = useMemo(() => {
        const actionLinkedData: GridLinkedData[] = [];
        const contentLinkedData: GridLinkedData[] = [];

        data.forEach((datum: LinkedData) => {
            if (datum.action.length > 1) {
                actionLinkedData.push({ ...datum, content: datum.action[0] });
                contentLinkedData.push({ ...datum, content: datum.action[0] });
                actionLinkedData.push({ ...datum, content: datum.action[1] });
                [...datum.content_syntactic].forEach((char) => {
                    contentLinkedData.push({ ...datum, content: char });
                });
            } else {
                actionLinkedData.push({ ...datum, content: datum.action[0] });
                [...datum.content_syntactic].forEach((char) => {
                    contentLinkedData.push({ ...datum, content: char });
                });
            }
        });

        return { actionLinkedData, contentLinkedData };
    }, [data]);

    // The card should never render if not enough action data is present
    if (actionLinkedData.length < 36) {
        return (
            <Card>
                <Card.Header title={title} Icon={DatasetIcon} />
                <Card.Body>
                    <Typography.Paragraph>Cannot display grid for {actionLinkedData.length} data points.</Typography.Paragraph>
                </Card.Body>
            </Card>
        );
    }

    const [showAction, setShowAction] = useState<boolean>(true);
    const toggleShowAction = (value: string): void => {
        if (value == 'Action') {
            setShowAction(true);
        } else {
            setShowAction(false);
        }
    };

    const { data: symbols } = useGetSymbolsQuery();

    const ref = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const fixedLinkedData: GridLinkedData[] = useMemo(() => (showAction ? actionLinkedData : contentLinkedData), [showAction, data]);
    const gridSize: number = useMemo(() => Math.ceil(Math.sqrt(fixedLinkedData.length)), [fixedLinkedData]);

    const [height, setHeight] = useState<number>(0);
    const [scale, setScale] = useState<number>(1);

    const { windowSize } = useResponsiveContext();

    useEffect(() => {
        const scale = (ref.current?.clientWidth || 1) / (gridRef.current?.clientWidth || 1);
        const theoreticalHeight = gridSize * 24;
        setHeight(theoreticalHeight * scale);
        setScale(scale);
    }, [fixedLinkedData.length, windowSize]);

    const controlProperties = useMemo(() => ({ '--v-height': `${height}px` }) as React.CSSProperties, [height]);

    const [showLabels, setShowLabels] = useState<boolean>(false);

    const gridItems: GridItemData[] = [];

    // Grid size or grid size - 1? A problem for me tommorow
    for (let row = 0; row < gridSize; row++) {
        const startIndex: number = row * gridSize;
        const endIndex: number = startIndex + gridSize;
        const rowData: GridLinkedData[] = fixedLinkedData.slice(startIndex, endIndex);

        if (rowData[0]) {
            gridItems.push(`${formatNumericDate(Number(rowData[0].created_at) * 1000)}`);
            gridItems.push(...rowData);
        }
    }

    const combinedLegend = useMemo(() => ({ ...(showAction ? actionLegend : contentLegend), ...pauseLegend }), [fixedLinkedData]);

    const legend: { symbol: string; color: string }[] = [];
    for (const [key, value] of Object.entries(combinedLegend)) {
        legend.push({ symbol: key, color: value });
    }

    const usedSymbols = useMemo(
        () =>
            Array.from(
                new Set(
                    fixedLinkedData.flatMap((value: GridLinkedData) => {
                        return showAction ? [...value.action] : [...value.content];
                    })
                )
            ),
        [fixedLinkedData]
    );

    const symbolToDefinition = (bloc: string): string => {
        if (!symbols) {
            return '';
        }

        const definitions = [...bloc].map((c) => symbols[c]);
        return definitions.join(', ');
    };

    const routeToTweet = (id: string): void => {
        const url = `https://twitter.com/${username}/status/${id}`;
        window.open(url, '_blank');
    };

    const [enabledSymbols, setEnabledSymbols] = useState<string[]>(usedSymbols);

    const changeSymbolEnabled = (symbol: string) => {
        if (enabledSymbols.includes(symbol)) {
            setEnabledSymbols(enabledSymbols.filter((s) => s != symbol));
        } else {
            setEnabledSymbols([...enabledSymbols, symbol]);
        }
    };

    useEffect(() => {
        setEnabledSymbols(usedSymbols);
    }, [usedSymbols]);

    const createItemSquare = (item: GridLinkedData, index: number): React.ReactNode => {
        const pause = Object.keys(pauseLegend).includes(item.content);
        const popoverContent = (
            <div className={style.popoverContent}>
                {pause ? (
                    <span className={style.title}>{symbolToDefinition(item.content)}</span>
                ) : (
                    <>
                        <Row align="space-between" className={style.title}>
                            <span>{symbolToDefinition(item.content)}</span>
                            <span style={{ fontSize: '1rem' }}>{formatReadableDate(new Date(Number(item.created_at) * 1000), true)}</span>
                        </Row>
                        <hr style={{ margin: '0.5rem 0' }} />
                        <span>{item.text}</span>
                    </>
                )}
            </div>
        );

        const getBackgroundColor = () => {
            if (!enabledSymbols.includes(item.content)) {
                return 'white';
            } else {
                return combinedLegend[item.content] ?? 'white';
            }
        };

        return (
            <Popover
                key={index}
                content={popoverContent}
                anchorClass={style.item}
                anchorProps={{ style: { backgroundColor: getBackgroundColor() }, onClick: !pause ? (): void => routeToTweet(item.id) : undefined }}
                customStyle={style.popover}
            >
                {showLabels && <em>{item.content}</em>}
            </Popover>
        );
    };

    return (
        <Card fullHeight>
            <Card.Header title={title} subtitle="Explore patterns in behaviors." Icon={DatasetIcon} />
            <Card.Body>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: designTokens.space.md }}>
                    <span style={{ width: 'min(calc(90% - 150px), 600px)' }}>
                        <Dropdown
                            options={[
                                { label: 'Action', value: 'Action' },
                                { label: 'Content', value: 'Content' }
                            ]}
                            isClearable={false}
                            onChange={(v) => toggleShowAction(v as string)}
                            defaultValue="Action"
                        />
                    </span>
                    <span style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', marginRight: designTokens.space.lg, gap: designTokens.space.sm }}>
                        Labels <Switch defaultChecked={showLabels} onChange={(event: FormEvent<HTMLInputElement>) => setShowLabels(event.currentTarget.checked)} />
                    </span>
                </div>
                <div className={style.legend}>
                    <div className={style.legendList}>
                        {legend.map((item) => {
                            return (
                                <div
                                    className={style.legendKey}
                                    key={item.symbol}
                                    style={!usedSymbols.includes(item.symbol) ? { display: 'none' } : !enabledSymbols.includes(item.symbol) ? { opacity: '33%' } : undefined}
                                >
                                    <Button onClick={() => changeSymbolEnabled(item.symbol)}>
                                        <span className={style.legendKeyColor} style={{ backgroundColor: item.color }} />
                                        {symbolToDefinition(item.symbol)}
                                        <span style={{ marginLeft: designTokens.space.sm }}>
                                            <b>({gridItems.filter((data) => typeof data !== 'string' && (data as GridLinkedData).content == item.symbol).length})</b>
                                        </span>
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className={style.gridControl} style={controlProperties}>
                    <TransformWrapper initialScale={scale} minScale={scale - 0.25} maxScale={2} initialPositionX={0} initialPositionY={0}>
                        {({ zoomIn, zoomOut, resetTransform, setTransform }) => {
                            setTransform(0, 0, scale);
                            return (
                                <div ref={ref} className={style.gridCard}>
                                    <TransformComponent>
                                        <div ref={gridRef} className={style.grid} style={{ gridTemplateColumns: `repeat(${gridSize + 1}, 1fr)`, width: gridSize * 24 + 80 }}>
                                            {gridItems.map((item: GridItemData, index) => {
                                                if (index % (gridSize + 1) == 0) {
                                                    return (
                                                        <div className={style.label} key={index}>
                                                            {item as string}
                                                        </div>
                                                    );
                                                } else {
                                                    return createItemSquare(item as GridLinkedData, index);
                                                }
                                            })}
                                        </div>
                                    </TransformComponent>
                                    <div className={style.tools}>
                                        <Button onClick={() => resetTransform()} Icon={RecenterIcon} rounded />
                                        <Button onClick={() => zoomOut()} Icon={ZoomOutIcon} rounded />
                                        <Button onClick={() => zoomIn()} Icon={ZoomInIcon} rounded />
                                    </div>
                                </div>
                            );
                        }}
                    </TransformWrapper>
                </div>
            </Card.Body>
        </Card>
    );
};

export { GridViewCard };
