// This file was auto-generated on Sun Jul 21 2019 21:09:20 GMT+0300 (Eastern European Summer Time)

import * as t from 'io-ts';

export const Error = t.type({ type: t.string, message: t.array(t.string) });
export type Error = t.TypeOf<typeof Error>;

export const Credentials = t.record(t.string, t.string);
export type Credentials = t.TypeOf<typeof Credentials>;

export const FeatureMap = t.UnknownRecord;
export type FeatureMap = t.TypeOf<typeof FeatureMap>;

export const FeatureNumericRange = t.partial({
  limit: t.number,
  cost_multiple: t.number,
});
export type FeatureNumericRange = t.TypeOf<typeof FeatureNumericRange>;

export const FeatureNumericDetails = t.partial({
  increment: t.number,
  min: t.number,
  max: t.number,
  suffix: t.string,
  cost_ranges: t.array(FeatureNumericRange),
});
export type FeatureNumericDetails = t.TypeOf<typeof FeatureNumericDetails>;

export const FeatureValue = t.type({ feature: t.string, value: t.string });
export type FeatureValue = t.TypeOf<typeof FeatureValue>;

export const PlanBody = t.intersection([
  t.type({
    provider_id: t.string,
    product_id: t.string,
    name: t.string,
    label: t.string,
    state: t.string,
    regions: t.array(t.string),
    features: t.array(FeatureValue),
    cost: t.number,
  }),
  t.partial({ resizable_to: t.array(t.string), trial_days: t.number }),
]);
export type PlanBody = t.TypeOf<typeof PlanBody>;

export const CreatePlan = t.type({ body: PlanBody });
export type CreatePlan = t.TypeOf<typeof CreatePlan>;

export const Plan = t.type({
  id: t.string,
  version: t.union([t.literal(1)]),
  type: t.union([t.literal('plan')]),
  body: PlanBody,
});
export type Plan = t.TypeOf<typeof Plan>;

export const FeatureValueDetailsPrice = t.partial({
  cost: t.number,
  multiply_factor: t.number,
  formula: t.string,
  description: t.string,
});
export type FeatureValueDetailsPrice = t.TypeOf<
  typeof FeatureValueDetailsPrice
>;

export const FeatureValueDetails = t.intersection([
  t.type({ label: t.string, name: t.string }),
  t.partial({
    cost: t.number,
    price: FeatureValueDetailsPrice,
    numeric_details: FeatureNumericDetails,
  }),
]);
export type FeatureValueDetails = t.TypeOf<typeof FeatureValueDetails>;

export const FeatureType = t.intersection([
  t.type({
    label: t.string,
    name: t.string,
    type: t.union([
      t.literal('boolean'),
      t.literal('string'),
      t.literal('number'),
    ]),
  }),
  t.partial({
    customizable: t.boolean,
    upgradable: t.boolean,
    downgradable: t.boolean,
    measurable: t.boolean,
    values: t.array(FeatureValueDetails),
  }),
]);
export type FeatureType = t.TypeOf<typeof FeatureType>;

export const ExpandedFeature = t.intersection([
  t.partial({ value_string: t.string, value: FeatureValueDetails }),
  FeatureType,
]);
export type ExpandedFeature = t.TypeOf<typeof ExpandedFeature>;

export const ExpandedPlanBody = t.intersection([
  t.partial({
    expanded_features: t.array(ExpandedFeature),
    free: t.boolean,
    defaultCost: t.number,
    customizable: t.boolean,
  }),
  PlanBody,
]);
export type ExpandedPlanBody = t.TypeOf<typeof ExpandedPlanBody>;

export const ExpandedPlan = t.type({
  id: t.string,
  version: t.union([t.literal(1)]),
  type: t.union([t.literal('plan')]),
  body: ExpandedPlanBody,
});
export type ExpandedPlan = t.TypeOf<typeof ExpandedPlan>;

export const ProductIntegrationFeatures = t.partial({
  access_code: t.boolean,
  sso: t.boolean,
  plan_change: t.boolean,
  region: t.union([t.literal('user-specified'), t.literal('unspecified')]),
});
export type ProductIntegrationFeatures = t.TypeOf<
  typeof ProductIntegrationFeatures
>;

export const ProductListingMarketing = t.partial({
  beta: t.boolean,
  new: t.boolean,
  featured: t.boolean,
});
export type ProductListingMarketing = t.TypeOf<typeof ProductListingMarketing>;

export const ProductListing = t.partial({
  public: t.boolean,
  listed: t.boolean,
  marketing: ProductListingMarketing,
});
export type ProductListing = t.TypeOf<typeof ProductListing>;

export const ProviderBody = t.intersection([
  t.type({ team_id: t.string, label: t.string, name: t.string }),
  t.partial({
    logo_url: t.string,
    support_email: t.string,
    documentation_url: t.string,
  }),
]);
export type ProviderBody = t.TypeOf<typeof ProviderBody>;

export const CreateProvider = t.type({ body: ProviderBody });
export type CreateProvider = t.TypeOf<typeof CreateProvider>;

export const Provider = t.type({
  id: t.string,
  version: t.union([t.literal(1)]),
  type: t.union([t.literal('provider')]),
  body: ProviderBody,
});
export type Provider = t.TypeOf<typeof Provider>;

export const RegionBody = t.type({
  platform: t.string,
  location: t.string,
  name: t.string,
  priority: t.number,
});
export type RegionBody = t.TypeOf<typeof RegionBody>;

export const CreateRegion = t.type({ body: RegionBody });
export type CreateRegion = t.TypeOf<typeof CreateRegion>;

export const Region = t.type({
  id: t.string,
  type: t.union([t.literal('region')]),
  version: t.union([t.literal(1)]),
  body: RegionBody,
});
export type Region = t.TypeOf<typeof Region>;

export const UpdatePlanBody = t.partial({
  name: t.string,
  label: t.string,
  state: t.string,
  has_resize_constraints: t.boolean,
  resizable_to: t.array(t.string),
  regions: t.array(t.string),
  features: t.array(FeatureValue),
  trial_days: t.number,
  cost: t.number,
});
export type UpdatePlanBody = t.TypeOf<typeof UpdatePlanBody>;

export const UpdatePlan = t.type({ id: t.string, body: UpdatePlanBody });
export type UpdatePlan = t.TypeOf<typeof UpdatePlan>;

export const UpdateProviderBody = t.partial({
  team_id: t.string,
  label: t.string,
  name: t.string,
  logo_url: t.string,
  support_email: t.string,
  documentation_url: t.string,
});
export type UpdateProviderBody = t.TypeOf<typeof UpdateProviderBody>;

export const UpdateProvider = t.type({
  id: t.string,
  body: UpdateProviderBody,
});
export type UpdateProvider = t.TypeOf<typeof UpdateProvider>;

export const ValueProp = t.type({ header: t.string, body: t.string });
export type ValueProp = t.TypeOf<typeof ValueProp>;

export const ProductBodyTerms = t.intersection([
  t.type({ provided: t.boolean }),
  t.partial({ url: t.string }),
]);
export type ProductBodyTerms = t.TypeOf<typeof ProductBodyTerms>;

export const ProductBodyBilling = t.type({
  type: t.union([
    t.literal('monthly-prorated'),
    t.literal('monthly-anniversary'),
    t.literal('annual-anniversary'),
  ]),
  currency: t.union([t.literal('usd')]),
});
export type ProductBodyBilling = t.TypeOf<typeof ProductBodyBilling>;

export const ProductBodyIntegration = t.intersection([
  t.type({
    provisioning: t.string,
    base_url: t.string,
    version: t.union([t.literal('v1')]),
    features: ProductIntegrationFeatures,
  }),
  t.partial({ sso_url: t.string }),
]);
export type ProductBodyIntegration = t.TypeOf<typeof ProductBodyIntegration>;

export const ProductBody = t.intersection([
  t.type({
    provider_id: t.string,
    label: t.string,
    name: t.string,
    state: t.string,
    listing: ProductListing,
    logo_url: t.string,
    tagline: t.string,
    value_props: t.array(ValueProp),
    images: t.array(t.string),
    support_email: t.string,
    documentation_url: t.string,
    terms: ProductBodyTerms,
    feature_types: t.array(FeatureType),
    billing: ProductBodyBilling,
    integration: ProductBodyIntegration,
  }),
  t.partial({ tags: t.array(t.string) }),
]);
export type ProductBody = t.TypeOf<typeof ProductBody>;

export const CreateProduct = t.type({ body: ProductBody });
export type CreateProduct = t.TypeOf<typeof CreateProduct>;

export const ExpandedProduct = t.intersection([
  t.type({
    id: t.string,
    version: t.union([t.literal(1)]),
    type: t.union([t.literal('product')]),
    body: ProductBody,
    provider: Provider,
  }),
  t.partial({ plans: t.array(ExpandedPlan) }),
]);
export type ExpandedProduct = t.TypeOf<typeof ExpandedProduct>;

export const Product = t.type({
  id: t.string,
  version: t.union([t.literal(1)]),
  type: t.union([t.literal('product')]),
  body: ProductBody,
});
export type Product = t.TypeOf<typeof Product>;

export const UpdateProductBodyIntegration = t.partial({
  provisioning: t.string,
  base_url: t.string,
  sso_url: t.string,
  version: t.union([t.literal('v1')]),
  features: ProductIntegrationFeatures,
});
export type UpdateProductBodyIntegration = t.TypeOf<
  typeof UpdateProductBodyIntegration
>;

export const UpdateProductBody = t.partial({
  name: t.string,
  logo_url: t.string,
  listing: ProductListing,
  tagline: t.string,
  value_props: t.array(ValueProp),
  images: t.array(t.string),
  support_email: t.string,
  documentation_url: t.string,
  terms_url: t.string,
  feature_types: t.array(FeatureType),
  integration: UpdateProductBodyIntegration,
  tags: t.array(t.string),
});
export type UpdateProductBody = t.TypeOf<typeof UpdateProductBody>;

export const UpdateProduct = t.type({ id: t.string, body: UpdateProductBody });
export type UpdateProduct = t.TypeOf<typeof UpdateProduct>;

