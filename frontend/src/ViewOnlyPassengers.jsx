import HealthRecords from './HealthRecords';

// This is just a wrapper to make it clear this is read-only for police officers
function ViewOnlyPassengers() {
  return <HealthRecords />;
}

export default ViewOnlyPassengers;
