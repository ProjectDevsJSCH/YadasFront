/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Enterprise } from '@/model/enterprise/enterprise.enum';
import { getTokenData } from '@/model/user/get-token-data';
import { UserRoles } from '@/model/user/user-rol.enum';
import { get } from 'lodash';

type RoleRules = {
  [key in UserRoles]?: Array<string | number>
};
type EnterpriseRules = {
  [key in Enterprise]?: Array<string | number>
};

export abstract class AccessControl {
  static omitFeatures<T extends number | string>(
    features: Array<T>,
    roleRules: RoleRules = {},
    enterpriseRules: EnterpriseRules = {},
    path?: string,
  ) {
    return this.baseFeatureFilter(features, roleRules, enterpriseRules, path);
  }

  static includeFeatures<T extends number | string>(
    features: Array<T>,
    roleRules: RoleRules = {},
    enterpriseRules: EnterpriseRules = {},
  ) {
    return this.baseFeatureFilter(features, roleRules, enterpriseRules);
  }

  static baseFeatureFilter<T extends number | string>(
    features: Array<T>,
    roleRules: RoleRules = {},
    enterpriseRules: EnterpriseRules = {},
    path?: string,
  ) {
    const token = getTokenData();

    if (token && (!token.rol || !token.enterprise)) return [];

    return features
      .filter(
        (feature) => !this.checkRuleExistence<T>(feature, roleRules[token.rol!] ?? [], path),
      )
      .filter(
        (feature) => !this.checkRuleExistence<T>(feature, enterpriseRules[token.enterprise!] ?? [], path),
      );
  }

  private static checkRuleExistence<T extends number | string>(
    feature: T,
    rules: Array<string | number>,
    path?: string,
  ) {
    let compareValue: string | number = feature;

    if (typeof feature === 'object' && path) {
      compareValue = get(feature, path, '');
    }

    return rules.includes(compareValue);
  }
}
