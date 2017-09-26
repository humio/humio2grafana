
export class HumioHelper {}

HumioHelper.checkToDateNow = (toDateCheck) => {
  if (typeof toDateCheck == "string") {
    return toDateCheck.match(/^(now[^-]|now$)/) != null;
  } else {
    return false;
  }
};

HumioHelper.getPanelType = (queryStr) => {
  let buf = queryStr.split('|'); // getting last part in the pipe
  let lastFx = buf[buf.length-1];
  if (lastFx.trim().match(/^timechart\(.*\)$/)) {
    return 'time-chart';
  } else {
    return undefined;
  }
};

HumioHelper.parseDateFrom = (date) => {
  switch (date) {
    case 'now-2d':
      {
        return '2d';
      }
      break;
    case 'now-7d':
      {
        return '7d';
      }
      break;
    case 'now-30d':
      {
        return '30d';
      }
      break;
    case 'now-90d':
      {
        return '90d';
      }
      break;
    case 'now-6M':
      {
        return '180d';
      }
      break;
    case 'now-1y':
      {
        return '1y';
      }
      break;
    case 'now-2y':
      {
        return '2y';
      }
      break;
    case 'now-5y':
      {
        return '5y';
      }
      break;
    case 'now-1d/d':
      {
        return '1d';
      }
      break;
    case 'now-2d/d':
      {
        return '2d';
      }
      break;
    case 'now-7d/d':
      {
        return '7d';
      }
      break;
    case 'now-1w/w':
      {
        return '7d';
      }
      break;
    case 'now-1M/M':
      {
        return '1m';
      }
      break;
    case 'now-1y/y':
      {
        return '1y';
      }
      break;
    case 'now/d':
      {
        return '1d';
      }
      break;
    case 'now/w':
      {
        return '7d';
      }
      break;
    case 'now/M':
      {
        return '1m';
      }
      break;
    case 'now/y':
      {
        return '1y';
      }
      break;
    case 'now-5m':
      {
        return '5m';
      }
      break;
    case 'now-15m':
      {
        return '15m';
      }
      break;
    case 'now-30m':
      {
        return '30m';
      }
      break;
    case 'now-1h':
      {
        return '1h';
      }
      break;
    case 'now-3h':
      {
        return '3h';
      }
      break;
    case 'now-6h':
      {
        return '6h';
      }
      break;
    case 'now-12h':
      {
        return '12h';
      }
      break;
    case 'now-24h':
      {
        return '24h';
      }
      break;
    default:
      {
        return '24h';
      }
      break;
  }
};
