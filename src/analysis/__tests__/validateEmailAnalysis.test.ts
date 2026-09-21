import { describe, expect, it } from 'vitest';

import { validateEmailAnalysis } from '../validateEmailAnalysis.js';

import type { EmailForAnalysis } from '../../types/emailForAnalysis.js';

const emails: EmailForAnalysis[] = [
  {
    id: '1',
    from: '',
    subject: '',
    textPreview: '',
  },
  {
    id: '2',
    from: '',
    subject: '',
    textPreview: '',
  },
  {
    id: '3',
    from: '',
    subject: '',
    textPreview: '',
  },
];

describe('validateEmailAnalysis', () => {
  it('accepts valid analysis', () => {
    const validation = validateEmailAnalysis(
      emails,
      {
        categories: [
          {
            name: 'Покупки',
            description: '',
            emailIds: ['1', '2'],
          },
          {
            name: 'Банки',
            description: '',
            emailIds: ['3'],
          },
        ],
      },
    );

    expect(validation.isValid).toBe(true);
    expect(validation.missingIds).toEqual([]);
    expect(validation.duplicateIds).toEqual([]);
    expect(validation.unknownIds).toEqual([]);
  });

  it('detects missing emails', () => {
    const validation = validateEmailAnalysis(
      emails,
      {
        categories: [
          {
            name: 'Покупки',
            description: '',
            emailIds: ['1', '2'],
          },
        ],
      },
    );

    expect(validation.isValid).toBe(false);
    expect(validation.missingIds).toEqual(['3']);
  });

  it('detects duplicate emails', () => {
    const validation = validateEmailAnalysis(
      emails,
      {
        categories: [
          {
            name: 'Покупки',
            description: '',
            emailIds: ['1', '2'],
          },
          {
            name: 'Банки',
            description: '',
            emailIds: ['2', '3'],
          },
        ],
      },
    );

    expect(validation.isValid).toBe(false);
    expect(validation.duplicateIds).toEqual(['2']);
  });

  it('detects unknown emails', () => {
    const validation = validateEmailAnalysis(
      emails,
      {
        categories: [
          {
            name: 'Покупки',
            description: '',
            emailIds: ['1', '2', '3', '999'],
          },
        ],
      },
    );

    expect(validation.isValid).toBe(false);
    expect(validation.unknownIds).toEqual(['999']);
  });
});