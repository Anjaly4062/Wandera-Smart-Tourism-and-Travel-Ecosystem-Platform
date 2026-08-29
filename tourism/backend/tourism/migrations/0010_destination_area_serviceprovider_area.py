from django.db import migrations, models

def populate_areas(apps, schema_editor):
    Destination = apps.get_model('tourism', 'Destination')
    ServiceProvider = apps.get_model('tourism', 'ServiceProvider')

    for d in Destination.objects.all():
        if not d.area and d.location:
            d.area = d.location.strip()
            d.save()

    for sp in ServiceProvider.objects.all():
        if not sp.area:
            if sp.destination and sp.destination.location:
                sp.area = (sp.destination.area or sp.destination.location).strip()
            elif sp.location:
                sp.area = sp.location.strip()
            else:
                try:
                    if hasattr(sp, 'hotel') and sp.hotel and sp.hotel.location:
                        sp.area = sp.hotel.location.strip()
                    elif hasattr(sp, 'restaurant') and sp.restaurant and sp.restaurant.location:
                        sp.area = sp.restaurant.location.strip()
                    elif hasattr(sp, 'transportation') and sp.transportation:
                        sp.area = (sp.transportation.service_area or sp.transportation.starting_location or "").strip()
                    elif hasattr(sp, 'activity') and sp.activity and sp.activity.location:
                        sp.area = sp.activity.location.strip()
                except Exception:
                    pass
            sp.save()

class Migration(migrations.Migration):

    dependencies = [
        ('tourism', '0009_transportation_address_transportation_district_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='destination',
            name='area',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='serviceprovider',
            name='area',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.RunPython(populate_areas, reverse_code=migrations.RunPython.noop),
    ]
