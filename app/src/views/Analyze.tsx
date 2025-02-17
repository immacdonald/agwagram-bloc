import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Accordion, FileUploadPortal, Heading, MultiDropdown, NullablePrimitive, StyledLink, TabGroup, Typography } from 'phantom-library';
import { getStaticDataFile } from 'src/utility';
import { config } from '@config';
import { useSetAnalyzeFilesMutation } from '@data/apiSlice';
import { selectConfig, setAnalysis } from '@data/settingsSlice';

const maxFiles: number = 4;

const Analyze: React.FC = () => {
    const [setFiles] = useSetAnalyzeFilesMutation();
    const analysisConfig = useSelector(selectConfig);
    const dispatch = useDispatch();

    const submitFiles = (files: File[]): void => {
        setFiles({ files, changeReport: !!analysisConfig.changeReports, sumgramLimit: analysisConfig.sumgramLimit || 1000, expertMode: !!analysisConfig.expertMode });
    };

    const submitJsonFiles = (files: StaticFile[]): void => {
        Promise.all(files.map((file) => getStaticDataFile(file.file)))
            .then((dataArray) => submitFiles(dataArray))
            .catch((error) => console.error('Error fetching files:', error));
    };

    const [selectedFilesInternal, setSelectedFilesInternal] = useState<string[]>([]);

    const selectedFiles = useMemo(() => config.exampleFiles.filter((file) => selectedFilesInternal.includes(file.title)), [selectedFilesInternal]);

    useEffect(() => {
        setSelectedFilesInternal([config.exampleFiles[config.exampleFilesInitial[Math.floor(Math.random() * config.exampleFilesInitial.length)]].title]);
    }, []);

    useEffect(() => {
        if (selectedFiles.length > 0) {
            submitJsonFiles(selectedFiles);
        } else {
            dispatch(setAnalysis(null));
            //console.log('No files!');
        }
    }, [selectedFilesInternal]);

    const helperText = useMemo(() => {
        if (selectedFiles.length > 0) {
            return (
                <Typography.Text>
                    Download{' '}
                    {selectedFiles.map((file: StaticFile, index) => (
                        <Fragment key={index}>
                            <StyledLink to={`/data/${file.file}`} download>
                                {file.title} {file.type}
                            </StyledLink>
                            {index < selectedFiles.length - 1 && ', '}
                        </Fragment>
                    ))}
                </Typography.Text>
            );
        } else {
            return false;
        }
    }, [selectedFiles]);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSelectedMode(params.get('mode') == 'upload' ? 1 : 0);
    }, [location.search]);

    const searchMode = (): number => {
        const params = new URLSearchParams(location.search);
        return params.get('mode') == 'upload' ? 1 : 0;
    };

    const [selectedMode, setSelectedMode] = useState<number>(searchMode());

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (!(params.get('mode') == 'upload' && selectedMode == 1)) {
            params.set('mode', selectedMode == 1 ? 'upload' : 'examples');
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
        }
    }, [selectedMode]);

    return (
        <TabGroup
            variant="segmented"
            selectedIndex={selectedMode}
            onChange={(value: number) => setSelectedMode(value)}
            tabs={[
                {
                    label: 'Pick An Account',
                    tab: (
                        <div>
                            <Heading minor>Analyze From Examples</Heading>
                            <Typography.Paragraph>Test agwagram by selecting from our sample of tweet files.</Typography.Paragraph>
                            <MultiDropdown
                                options={config.exampleFiles.map((file: ExampleFile) => ({ label: file.title, value: file.title }))}
                                placeholder="Select File"
                                defaultValue={selectedFilesInternal}
                                onChange={(selected: NullablePrimitive[]) => {
                                    if (selectedFilesInternal.length < maxFiles) {
                                        setSelectedFilesInternal(selected as string[]);
                                    } else {
                                        const capped = selected as string[];
                                        capped.shift();
                                        setSelectedFilesInternal(capped);
                                    }
                                }}
                                value={selectedFilesInternal}
                            />
                            <br />
                            {helperText}
                        </div>
                    )
                },
                {
                    label: 'Upload Tweets File(s)',
                    tab: (
                        <div>
                            <Heading minor>Analyze File</Heading>
                            <Typography.Text>Upload tweet file(s) to be analyzed by agwagram.</Typography.Text>
                            <Accordion label="File Requirements">
                                <Typography.Paragraph>
                                    Files must be in <strong>JSON</strong> or <strong>JSONL</strong> formats and may be uploaded uncompressed or as Gzip files. To upload multiple files at once, please
                                    select all your files in the file selection prompt or drag-and-drop them individually.
                                </Typography.Paragraph>
                                <Typography.Paragraph>
                                    JSON files must contain the tweet data as a array of Twitter{' '}
                                    <Link to="https://web.archive.org/web/20240615012946/https://developer.x.com/en/docs/twitter-api/v1/data-dictionary/object-model/tweet" target="_blank">
                                        v1.1 tweet
                                    </Link>{' '}
                                    objects. JSONL files must contain a{' '}
                                    <Link to="https://web.archive.org/web/20240615012946/https://developer.x.com/en/docs/twitter-api/v1/data-dictionary/object-model/tweet" target="_blank">
                                        v1.1 tweet
                                    </Link>{' '}
                                    per line, <i>not</i> an account. For more details, download a tweet file from the "Example Files" tab.
                                </Typography.Paragraph>
                            </Accordion>
                            <FileUploadPortal submit={submitFiles} maxFiles={maxFiles} />
                        </div>
                    )
                }
            ]}
        />
    );
};

export { Analyze };
