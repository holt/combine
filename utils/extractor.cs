using System.Threading.Tasks;

using System;
using System.Dynamic;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using System.Resources;

public class Startup
{
    private const string resourcesSuffix = ".resources";

    public async Task<object> Invoke(ExpandoObject conf)
    {

    dynamic props = new ExpandoObject();
    props.conf = conf;
    Assembly assembly = Assembly.LoadFrom(props.conf.name);
    object[] locales = props.conf.locales;
    string[] manifestResourceNames = assembly.GetManifestResourceNames();
    int manifestResourceLength = manifestResourceNames.Length;
    Dictionary<string, Dictionary<string, string>> result = new Dictionary<string, Dictionary<string, string>>();

    for (int i = 0; i < locales.Length; i++) {

        string locale = (string)locales[i];

        CultureInfo cultureInfo = CultureInfo.CreateSpecificCulture(locale);

        for (int i2 = 0; i2 < manifestResourceLength; i2++)
        {
            string manifestResourceName = manifestResourceNames[i2];

            if (manifestResourceName.EndsWith(resourcesSuffix))
            {
                manifestResourceName = manifestResourceName.Substring(0, manifestResourceName.Length - resourcesSuffix.Length);
                ResourceManager resourceManager = new ResourceManager(manifestResourceName, assembly);
                ResourceSet resourceSet = resourceManager.GetResourceSet(cultureInfo, true, true);

                if (resourceSet != null)
                {
                    Dictionary<string, string> resourceDictionary = new Dictionary<string, string>();

                    foreach (object item in resourceSet)
                    {
                        if (item is DictionaryEntry)
                        {
                            DictionaryEntry entry = (DictionaryEntry)item;
                            string key = entry.Key as string;

                            if (key != null)
                            {
                                string value = entry.Value as string;

                                if (value != null)
                                {
                                    resourceDictionary[key] = value;
                                }
                            }
                        }
                    }

                    if (resourceDictionary.Count > 0)
                    {
                        result[locale] = resourceDictionary;
                    }
                }
            }
        }

    }

    if (result.Count > 0)
    {
        return result;
    }   

    return result;

    }
}