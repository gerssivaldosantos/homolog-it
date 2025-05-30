import { issueStateSchema, linearIssueDataSchema } from './schema';

describe('issueStateSchema', () => {
  it('should validate a valid state', () => {
    expect(issueStateSchema.parse({ name: 'Done' })).toEqual({ name: 'Done' });
  });

  it('should reject an invalid state', () => {
    expect(() => issueStateSchema.parse({})).toThrow();
    expect(() => issueStateSchema.parse({ name: 123 })).toThrow();
  });
});

describe('linearIssueDataSchema', () => {
  const validData = {
    type: 'Issue',
    action: 'update',
    actor: { id: 'user-1', name: 'User' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedFrom: {},
    data: {
      state: { name: 'Done' },
      identifier: 'ISSUE-1',
      title: 'Title',
      url: 'https://linear.app/issue/ISSUE-1',
      team: { key: 'ENG' }
    }
  };

  it('should validate a valid payload', () => {
    expect(linearIssueDataSchema.parse(validData)).toMatchObject(validData);
  });

  it('should accept optional webhookTimestamp', () => {
    const withTimestamp = {
      ...validData,
      data: { ...validData.data, webhookTimestamp: 1234567890 }
    };
    expect(linearIssueDataSchema.parse(withTimestamp)).toMatchObject(withTimestamp);
  });

  it('should reject if required fields are missing', () => {
    const { type, ...rest } = validData;
    expect(() => linearIssueDataSchema.parse(rest)).toThrow();
  });

  it('should reject if type is not Issue', () => {
    expect(() => linearIssueDataSchema.parse({ ...validData, type: 'Other' })).toThrow();
  });

  it('should reject if state.name is not a string', () => {
    const invalid = { ...validData, data: { ...validData.data, state: { name: 123 } } };
    expect(() => linearIssueDataSchema.parse(invalid)).toThrow();
  });
});
