/*
Details of a submitted job
*/
import { JobStatus } from '/shared/types'
import { Messages } from './Messages'
import { Settings } from './Settings'
import { Results } from './Results'
import { Section } from '../Section'

import { ID } from '../../utils/utils'

const { App } = window

const readableStatus = {
    IDLE: 'Waiting',
    RUNNING: 'Running',
    ERROR: 'Error',
    SUCCESS: 'Completed',
    FAIL: 'Error',
}

export function JobDetailsPane({ job, onClose }) {
    return (
        <>
            <section
                className="header"
                aria-labelledby={`${ID(job.internalId)}-hd`}
            >
                <div>
                    <h1 id={`${ID(job.internalId)}-hd`}>
                        {job.jobData.nicename}
                    </h1>
                    {/* <p>{job.script.description}</p> */}
                    <p aria-live="polite">
                        Status:&nbsp;
                        <span
                            className={`status ${readableStatus[
                                job.jobData.status
                            ].toLowerCase()}`}
                        >
                            {readableStatus[job.jobData.status]}{' '}
                        </span>
                    </p>
                    {job.jobData.progress ? (
                        <p aria-live="polite">
                            Progress:&nbsp;
                            <span>{job.jobData.progress * 100}%</span>
                        </p>
                    ) : (
                        ''
                    )}
                    <details
                        id={`${ID(job.internalId)}-job-settings`}
                        className="job-settings"
                    >
                        <summary>Settings</summary>
                        <Settings job={job} />
                    </details>
                </div>
            </section>

            <div className="details">
                <Section
                    label="Results"
                    className="job-results"
                    id={`${ID(job.internalId)}-job-results`}
                >
                    <Results job={job} />
                </Section>
                <Section
                    label="Messages"
                    className="job-messages"
                    id={`${ID(job.internalId)}-job-messages`}
                >
                    <Messages job={job} />
                </Section>
                {job.jobData.status != JobStatus.RUNNING &&
                job.jobData.status != JobStatus.IDLE ? (
                    <button onClick={(e) => onClose(job, e)}>Delete job</button>
                ) : (
                    ''
                )}
            </div>
        </>
    )
}
