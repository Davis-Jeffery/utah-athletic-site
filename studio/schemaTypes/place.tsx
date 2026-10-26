// A real place picked with the place search (studio/components/PlaceSearch.tsx): name, address,
// exact spot and Google place id. Used by venues, tournaments and map pins; the site makes
// directions links from it (studio/shared/places.ts).
//
// options.fill names fields on the same document to fill in when a place is picked, e.g.
// { address: 'address', name: 'name' } (name only when it's empty).
import { useCallback } from 'react';
import { defineField, defineType, set, unset, useDocumentOperation, useFormValue, type ObjectInputProps } from 'sanity';
import { Button, Card, Flex, Stack, Text } from '@sanity/ui';
import { PinIcon } from '@sanity/icons/Pin';
import { PlacePreview, PlaceSearch, placeLine } from '../components/PlaceSearch';
import type { Place } from '../shared/places';

type Fill = { name?: string; address?: string };

function PlaceInput(props: ObjectInputProps) {
  const { value, onChange, readOnly, schemaType } = props;
  const fill = (schemaType.options as { fill?: Fill } | undefined)?.fill;
  const id = String(useFormValue(['_id']) ?? '').replace(/^drafts\./, '');
  const type = String(useFormValue(['_type']) ?? '');
  const doc = useFormValue([]) as Record<string, unknown> | undefined;
  const { patch } = useDocumentOperation(id, type);
  const place = value as Place | undefined;

  const pick = useCallback((p: Place) => {
    onChange(set({ _type: 'place', ...p, ...(p.location ? { location: { _type: 'geopoint', ...p.location } } : {}) }));
    // Fill the document's own name and address fields too, so families see the same place.
    if (fill && id) {
      const changes: Record<string, string> = {};
      if (fill.address && p.address) changes[fill.address] = p.address;
      if (fill.name && p.name && !doc?.[fill.name]) changes[fill.name] = p.name;
      if (Object.keys(changes).length) patch.execute([{ set: changes }]);
    }
  }, [onChange, fill, id, doc, patch]);

  return (
    <Stack gap={3}>
      {place?.location ? (
        <Card padding={3} radius={2} border tone="positive">
          <Stack gap={3}>
            <Flex gap={3} align="center" justify="space-between" wrap="wrap">
              <Text size={1}>📍 {placeLine(place)}</Text>
              {readOnly ? null : <Button mode="bleed" tone="critical" fontSize={1} text="Remove" onClick={() => onChange(unset())} />}
            </Flex>
            <PlacePreview place={place} />
            <Text size={0} muted>Directions links go to this exact spot. Search again to change it.</Text>
          </Stack>
        </Card>
      ) : null}
      {readOnly ? null : <PlaceSearch onPick={pick} />}
    </Stack>
  );
}

export const place = defineType({
  name: 'place',
  title: 'Place',
  type: 'object',
  icon: PinIcon,
  components: { input: PlaceInput },
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'address', title: 'Address', type: 'string' }),
    defineField({ name: 'location', title: 'Spot', type: 'geopoint' }),
    defineField({ name: 'placeId', title: 'Google place id', type: 'string' }),
  ],
});
