export interface LinearActor {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  url: string;
  type: string;
}

export interface LinearState {
  id: string;
  color: string;
  name: string;
  type: string;
}

export interface LinearAssignee {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  url: string;
}

export interface LinearProject {
  id: string;
  name: string;
  url: string;
}

export interface LinearTeam {
  id: string;
  key: string;
  name: string;
}

export interface LinearUpdatedFrom {
  updatedAt: string;
  sortOrder: number;
  stateId: string;
  completedAt: string | null;
}

export interface LinearIssueData {
  id: string;
  identifier: string;
  title: string;
  url: string;
  state: LinearState;
  assignee: LinearAssignee;
  project: LinearProject;
  team: LinearTeam;
}

export interface LinearWebhookBody {
  action: string;
  actor: LinearActor;
  createdAt: string;
  data: LinearIssueData;
  updatedFrom: LinearUpdatedFrom;
  type: string;
  organizationId: string;
  webhookTimestamp: number;
  webhookId: string;
} 