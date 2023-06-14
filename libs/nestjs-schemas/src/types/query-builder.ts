export type RuleSet = {
  condition: 'and' | 'or';
  rules: (RuleSet | Rule)[];
};

export type Rule =
  | {
      field: string;
    } & (
      | {
          operation: 'equal' | 'notEqual';
          value: string | number | boolean;
        }
      | {
          operation: 'startsWith' | 'endsWith' | 'contains';
          value: string;
        }
      | {
          operation: 'less' | 'lessOrEqual' | 'greater' | 'greaterOrEqual';
          value: number | string;
        }
      | {
          operation: 'in' | 'notIn';
          value: (string | number | boolean)[];
        }
      | {
          operation: 'isNull' | 'isNotNull';
          value: null;
        }
    );
