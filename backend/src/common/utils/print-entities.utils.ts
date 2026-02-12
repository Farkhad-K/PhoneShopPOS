import { INestApplication } from '@nestjs/common';
import { DataSource, EntityMetadata } from 'typeorm';

export function printEntities(app: INestApplication): void {
  const ds = app.get(DataSource);
  const metas = ds.entityMetadatas;

  const out: string[] = [];
  for (const m of metas) {
    out.push(`# ${m.name} (${m.tableName})`);

    for (const c of m.columns) {
      const rawType =
        typeof c.type === 'function' ? c.type.name : String(c.type);
      const colType =
        rawType === 'enum' && Array.isArray(c.enum)
          ? `enum{${c.enum.join(' | ')}}`
          : c.length
            ? `${rawType}(${c.length})`
            : rawType;

      const flags: string[] = [];
      if (c.isPrimary) flags.push('PK');
      if (c.isGenerated) flags.push('auto');
      if (c.isNullable) flags.push('nullable');
      if (isColumnUnique(m, c)) flags.push('unique');

      const def = formatDefault(c.default);
      if (def !== undefined) flags.push(`default=${def}`);

      out.push(
        `- ${c.propertyName}: ${colType}${flags.length ? ` [${flags.join(', ')}]` : ''}`,
      );
    }

    for (const r of m.relations) {
      out.push(
        `  @relation ${r.propertyName}: ${r.relationType} -> ${r.inverseEntityMetadata?.name}`,
      );
    }

    out.push('');
  }

  console.log(out.join('\n'));
}

type ColumnMeta = EntityMetadata['columns'][number];
type ColumnRef = { databaseName: string; propertyName: string };

function isColumnUnique(m: EntityMetadata, c: ColumnMeta): boolean {
  const uniqueCols = new Set(
    m.uniques.flatMap((u) =>
      (u.columns as unknown as ColumnRef[]).map((col) => col.databaseName),
    ),
  );
  const uniqueIndexCols = new Set(
    m.indices
      .filter((i) => i.isUnique)
      .flatMap((i) =>
        (i.columns as unknown as ColumnRef[]).map((col) => col.databaseName),
      ),
  );
  return uniqueCols.has(c.databaseName) || uniqueIndexCols.has(c.databaseName);
}

function formatDefault(d: unknown): string | undefined {
  if (d === undefined || d === null) return undefined;
  switch (typeof d) {
    case 'string':
      return `'${d}'`;
    case 'number':
    case 'boolean':
      return String(d);
    case 'function': {
      let s: string;
      try {
        s = d.toString();
      } catch {
        return '[fn]';
      }
      return s.length > 60 ? `${s.slice(0, 57)}...` : s;
    }
    default: {
      try {
        return JSON.stringify(d);
      } catch {
        return '[object]';
      }
    }
  }
}
