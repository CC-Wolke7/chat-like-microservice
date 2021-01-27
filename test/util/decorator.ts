import { Transform } from 'class-transformer';

export function TransformToBoolean(): (target: any, key: any) => void {
  return Transform((value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;

    return value;
  });
}

export function TransformToStringArray(): (target: any, key: any) => void {
  return Transform((value) => {
    return value.split(',');
  });
}
