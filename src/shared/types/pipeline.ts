/**
 * Webservice connexion data to compute url for fetch:
 *
 * - host should be a valid ipv4 or hostname
 * - port should be a number matching an opened port on the host
 * - path should be a valid url subpath, starting by a "/" (but not ending by a "/"), like "/ws"
 * - ssl is a boolean stating if the webservice is using ssl encryptin (requiring https)
 *
 */
export type Webservice = {
  host: string
  port?: number
  path?: string
  ssl?: boolean
}
/**
 * Utility function to get base url string from webservice
 * @param ws webservice
 * @returns
 */
export function baseurl(ws: Webservice) {
  return `${ws.ssl ? 'https' : 'http'}://${ws.host}${
    ws.port ? ':' + ws.port : ''
  }${ws.path ?? ''}`
}

/**
 * Local instance possible status
 */
export enum PipelineStatus {
  UNKNOWN = 'unknown',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error',
}

/**
 * Local instance state to be used by front
 */
export interface PipelineState {
  runningWebservice?: Webservice
  status: PipelineStatus
  // messages: Array<string>
  // errors: Array<string>
}

export type Alive = {
  alive: boolean
  localfs?: boolean
  authentication?: boolean
  version?: string
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum Status {
  SUCCESS = 'SUCCESS',
  ERROR = 'Error',
  IDLE = 'Idle',
  RUNNING = 'Running',
  FAIL = 'Fail',
}

export type ResultFile = {
  mimeType: string
  size: string
  file?: string
  href?: string
}
export type NamedResult = {
  from: string
  href: string
  mimeType: string
  name: string
  nicename: string
  files: Array<ResultFile>
}

export type Results = {
  href: string
  mimeType: string
  namedResults: Array<NamedResult>
}

export enum MessageLevel {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE',
}

export type Message = {
  level: MessageLevel
  content: string
  sequence: number
  timestamp: number
}

export type AbstractJob = {
  id: string
  nicename?: string
  type: string
}

export type Job = AbstractJob & {
  href: string
  priority?: Priority
  status: Status
  log?: string
  results?: Results
  messages?: Array<Message>
  progress?: number
  script?: Script
  type: 'Job'
}

export type ScriptInput = {
  desc?: string
  mediaType?: string
  name: string
  sequence?: boolean
  required?: boolean
  nicename?: string
}

export type ScriptOption = {
  desc?: string
  mediaType?: string
  name: string
  sequence?: boolean
  required?: boolean
  nicename?: string
  ordered?: boolean
  type?: string
}

export type Script = {
  id: string
  href: string
  nicename: string
  description: string
  version?: string
  inputs?: Array<ScriptInput>
  options?: Array<ScriptOption>
}

export type NewJob = AbstractJob & {
  type: 'NewJob'
}

export type NameValue = {
  name: string
  value: string
}
export type Callback = {
  href: string
  type: ['messages', 'status']
  frequency: string
}
export type JobRequest = {
  scriptHref: string
  nicename?: string
  priority?: ['high', 'medium', 'low']
  batchId?: string
  inputs?: Array<NameValue>
  options?: Array<NameValue>
  outputs?: Array<NameValue>
  callbacks?: Array<Callback>
}
